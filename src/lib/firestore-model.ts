import { Timestamp } from 'firebase-admin/firestore';
import { connectDB } from '@/lib/db';

type AnyRecord = Record<string, any>;
type SortSpec = Record<string, 1 | -1>;
type ModelOptions = {
  timestamps?: boolean | { createdAt?: boolean; updatedAt?: boolean };
  unique?: string[];
};

const COLLECTION_BY_PATH: Record<string, string> = { userId: 'users', uploadedBy: 'admins' };

function normalize(value: any): any {
  if (value instanceof Timestamp) return value.toDate();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)]));
  }
  return value;
}

function clean(value: any): any {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, clean(item)])
    );
  }
  return value;
}

function comparable(value: any) {
  return value instanceof Date ? value.getTime() : value;
}

function matchesValue(actual: any, expected: any): boolean {
  if (expected instanceof RegExp) return expected.test(String(actual ?? ''));
  if (!expected || typeof expected !== 'object' || expected instanceof Date) {
    return comparable(actual) === comparable(expected);
  }
  if ('$regex' in expected) {
    const source = expected.$regex instanceof RegExp ? expected.$regex.source : String(expected.$regex);
    return new RegExp(source, expected.$options || expected.$regex?.flags || '').test(String(actual ?? ''));
  }
  if ('$in' in expected && !expected.$in.some((item: any) => comparable(item) === comparable(actual))) return false;
  if ('$ne' in expected && comparable(actual) === comparable(expected.$ne)) return false;
  if ('$gte' in expected && comparable(actual) < comparable(expected.$gte)) return false;
  if ('$gt' in expected && comparable(actual) <= comparable(expected.$gt)) return false;
  if ('$lte' in expected && comparable(actual) > comparable(expected.$lte)) return false;
  if ('$lt' in expected && comparable(actual) >= comparable(expected.$lt)) return false;
  return true;
}

function matches(doc: AnyRecord, filter: AnyRecord = {}): boolean {
  if (filter.$or && !filter.$or.some((part: AnyRecord) => matches(doc, part))) return false;
  if (filter.$expr?.$eq) {
    const [left, right] = filter.$expr.$eq;
    if (left?.$month) {
      const field = String(left.$month).replace(/^\$/, '');
      const value = doc[field] instanceof Date ? doc[field] : new Date(doc[field]);
      if (Number.isNaN(value.getTime()) || value.getMonth() + 1 !== Number(right)) return false;
    }
  }
  return Object.entries(filter)
    .filter(([key]) => key !== '$or' && key !== '$expr')
    .every(([key, expected]) => matchesValue(doc[key], expected));
}

function project(doc: AnyRecord, selection?: string): AnyRecord {
  if (!selection) return doc;
  const fields = selection.split(/\s+/).filter(Boolean);
  const included = fields.filter((field) => !field.startsWith('-'));
  if (!included.length) {
    const copy = { ...doc };
    fields.filter((field) => field.startsWith('-')).forEach((field) => delete copy[field.slice(1)]);
    return copy;
  }
  const output: AnyRecord = {};
  for (const field of included) if (field in doc) output[field] = doc[field];
  if ('_id' in doc && !fields.includes('-_id')) output._id = doc._id;
  return output;
}

class FirestoreDoc {
  _id: string;
  private __collection: string;

  constructor(collection: string, id: string, data: AnyRecord) {
    this.__collection = collection;
    this._id = id;
    Object.assign(this, data);
  }

  async save() {
    const db = await connectDB();
    const data = Object.fromEntries(
      Object.entries(this).filter(([key]) => key !== '_id' && key !== '__collection')
    );
    await db.collection(this.__collection).doc(this._id).set(clean(data), { merge: true });
    return this;
  }

  toJSON() {
    return Object.fromEntries(Object.entries(this).filter(([key]) => key !== '__collection'));
  }
}

class QueryBuilder implements PromiseLike<any> {
  private selection?: string;
  private sorting?: SortSpec;
  private skipCount = 0;
  private limitCount?: number;
  private populatePath?: string;
  private populateSelection?: string;

  constructor(
    private collection: string,
    private filter: AnyRecord,
    private single: boolean,
    private id?: string
  ) {}

  select(fields: string) { this.selection = fields; return this; }
  sort(spec: SortSpec) { this.sorting = spec; return this; }
  skip(count: number) { this.skipCount = count; return this; }
  limit(count: number) { this.limitCount = count; return this; }
  lean() { return this; }
  exec() { return this.run(); }
  populate(path: string, fields?: string) {
    this.populatePath = path;
    this.populateSelection = fields;
    return this;
  }

  private async run() {
    const db = await connectDB();
    let rows: AnyRecord[];
    if (this.id) {
      const snapshot = await db.collection(this.collection).doc(String(this.id)).get();
      rows = snapshot.exists ? [{ _id: snapshot.id, ...normalize(snapshot.data()) }] : [];
    } else {
      const snapshot = await db.collection(this.collection).get();
      rows = snapshot.docs
        .map((doc) => ({ _id: doc.id, ...normalize(doc.data()) }))
        .filter((doc) => matches(doc, this.filter));
    }

    if (this.sorting) {
      const entries = Object.entries(this.sorting);
      rows.sort((a, b) => {
        for (const [field, direction] of entries) {
          const av = comparable(a[field]);
          const bv = comparable(b[field]);
          if (av < bv) return -1 * direction;
          if (av > bv) return direction;
        }
        return 0;
      });
    }
    rows = rows.slice(this.skipCount, this.limitCount ? this.skipCount + this.limitCount : undefined);

    if (this.populatePath) {
      const targetCollection = COLLECTION_BY_PATH[this.populatePath];
      if (targetCollection) {
        rows = await Promise.all(rows.map(async (row) => {
          const targetId = row[this.populatePath!];
          if (!targetId) return row;
          const target = await db.collection(targetCollection).doc(String(targetId)).get();
          return {
            ...row,
            [this.populatePath!]: target.exists
              ? project({ _id: target.id, ...normalize(target.data()) }, this.populateSelection)
              : null,
          };
        }));
      }
    }

    const hydrated = rows.map((row) => {
      const projected = project(row, this.selection);
      return new FirestoreDoc(this.collection, row._id, projected);
    });
    return this.single ? hydrated[0] || null : hydrated;
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }
}

export function createFirestoreModel<T extends AnyRecord>(collection: string, options: ModelOptions = {}): any {
  const timestamps = options.timestamps;
  const shouldCreate = timestamps === true || (typeof timestamps === 'object' && timestamps.createdAt !== false);
  const shouldUpdate = timestamps === true || (typeof timestamps === 'object' && timestamps.updatedAt !== false);

  async function ensureUnique(data: AnyRecord, ignoreId?: string) {
    if (!options.unique?.length) return;
    const db = await connectDB();
    const snapshot = await db.collection(collection).get();
    const duplicate = snapshot.docs.some((doc) =>
      doc.id !== ignoreId && options.unique!.some((field) => data[field] != null && doc.data()[field] === data[field])
    );
    if (duplicate) {
      const error: any = new Error('Duplicate value');
      error.code = 11000;
      throw error;
    }
  }

  return {
    find(filter: AnyRecord = {}, _projection?: string) {
      const query = new QueryBuilder(collection, filter, false);
      return _projection ? query.select(_projection) : query;
    },
    findOne(filter: AnyRecord = {}) { return new QueryBuilder(collection, filter, true); },
    findById(id: any) { return new QueryBuilder(collection, {}, true, String(id)); },
    async create(input: T) {
      const db = await connectDB();
      const data: AnyRecord = clean({ ...input });
      await ensureUnique(data);
      const now = new Date();
      if (shouldCreate && !data.createdAt) data.createdAt = now;
      if (shouldUpdate) data.updatedAt = now;
      const ref = db.collection(collection).doc();
      await ref.set(data);
      return new FirestoreDoc(collection, ref.id, normalize(data));
    },
    async insertMany(inputs: T[]) { return Promise.all(inputs.map((input) => this.create(input))); },
    async countDocuments(filter: AnyRecord = {}) {
      const docs = await new QueryBuilder(collection, filter, false);
      return docs.length;
    },
    async estimatedDocumentCount() { return this.countDocuments({}); },
    async deleteOne(filter: AnyRecord) {
      const db = await connectDB();
      const doc = await new QueryBuilder(collection, filter, true);
      if (!doc) return { deletedCount: 0 };
      await db.collection(collection).doc(doc._id).delete();
      return { deletedCount: 1 };
    },
    async deleteMany(filter: AnyRecord) {
      const db = await connectDB();
      const docs = await new QueryBuilder(collection, filter, false);
      await Promise.all(docs.map((doc: AnyRecord) => db.collection(collection).doc(doc._id).delete()));
      return { deletedCount: docs.length };
    },
    async findByIdAndDelete(id: any) {
      const db = await connectDB();
      const doc = await new QueryBuilder(collection, {}, true, String(id));
      if (doc) await db.collection(collection).doc(String(id)).delete();
      return doc;
    },
    async findByIdAndUpdate(id: any, update: AnyRecord) {
      const db = await connectDB();
      const current = await new QueryBuilder(collection, {}, true, String(id));
      if (!current) return null;
      const data = clean({ ...(update.$set || update), ...(shouldUpdate ? { updatedAt: new Date() } : {}) });
      await ensureUnique({ ...current, ...data }, String(id));
      await db.collection(collection).doc(String(id)).set(data, { merge: true });
      return new FirestoreDoc(collection, String(id), { ...current.toJSON(), ...normalize(data) });
    },
    async updateOne(filter: AnyRecord, update: AnyRecord) {
      const doc = await new QueryBuilder(collection, filter, true);
      if (!doc) return { matchedCount: 0, modifiedCount: 0 };
      await this.findByIdAndUpdate(doc._id, update);
      return { matchedCount: 1, modifiedCount: 1 };
    },
    async updateMany(filter: AnyRecord, update: AnyRecord) {
      const docs = await new QueryBuilder(collection, filter, false);
      await Promise.all(docs.map((doc: AnyRecord) => this.findByIdAndUpdate(doc._id, update)));
      return { matchedCount: docs.length, modifiedCount: docs.length };
    },
    async aggregate(pipeline: AnyRecord[]) {
      let docs: AnyRecord[] = await new QueryBuilder(collection, {}, false);
      for (const stage of pipeline) {
        if (stage.$match) docs = docs.filter((doc) => matches(doc, stage.$match));
        if (stage.$group) {
          const field = String(stage.$group._id).replace(/^\$/, '');
          const groups = new Map<any, AnyRecord>();
          for (const doc of docs) {
            const key = doc[field];
            const group = groups.get(key) || { _id: key, totalAmount: 0, count: 0 };
            group.totalAmount += Number(doc.amount || 0);
            group.count += 1;
            groups.set(key, group);
          }
          docs = Array.from(groups.values());
        }
      }
      return docs;
    },
  };
}
