import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import logger from '@/lib/logger';

declare global {
  var __firestore: Firestore | undefined;
}

function privateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

export async function connectDB(): Promise<Firestore> {
  if (global.__firestore) return global.__firestore;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const key = privateKey();

  if (!getApps().length) {
    if (projectId && clientEmail && key) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey: key }), projectId });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({ credential: applicationDefault(), projectId });
    } else {
      throw new Error(
        'Firebase credentials missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
      );
    }
  }

  global.__firestore = getFirestore();
  logger.info({ route: 'db', phase: 'firestore_connected', projectId: projectId || 'application-default' });
  return global.__firestore;
}
