import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Firebase environment credentials are incomplete.');
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
}

const db = getFirestore();
const snapshot = await db.collection('admins').get();
console.log(`Admin records found: ${snapshot.size}`);

if (!process.argv.includes('--confirm')) {
  console.log('Read-only check complete. Pass --confirm to remove these admin records.');
  process.exit(0);
}

if (!snapshot.empty) {
  const batch = db.batch();
  snapshot.docs.forEach((document) => batch.delete(document.ref));
  await batch.commit();
}

const remaining = await db.collection('admins').count().get();
console.log(`Admin records remaining: ${remaining.data().count}`);
