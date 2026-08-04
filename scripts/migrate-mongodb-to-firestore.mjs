import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { MongoClient, ObjectId } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error('MONGODB_URI is required for the one-time migration');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!getApps().length) {
  initializeApp(
    projectId && clientEmail && privateKey
      ? { credential: cert({ projectId, clientEmail, privateKey }), projectId }
      : { credential: applicationDefault(), projectId }
  );
}

function convert(value) {
  if (value instanceof ObjectId) return value.toHexString();
  if (Array.isArray(value)) return value.map(convert);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convert(item)]));
  }
  return value;
}

const client = new MongoClient(mongoUri);
await client.connect();

try {
  const mongo = client.db();
  const firestore = getFirestore();
  const collections = ['admins', 'users', 'transactions', 'media', 'certificates'];

  for (const name of collections) {
    const documents = await mongo.collection(name).find({}).toArray();
    let batch = firestore.batch();
    let writes = 0;

    for (const document of documents) {
      const id = String(document._id);
      const { _id, ...data } = document;
      batch.set(firestore.collection(name).doc(id), convert(data));
      writes += 1;
      if (writes === 400) {
        await batch.commit();
        batch = firestore.batch();
        writes = 0;
      }
    }

    if (writes) await batch.commit();
    console.log(`${name}: migrated ${documents.length}`);
  }
} finally {
  await client.close();
}
