import { initializeApp, getApps, cert } from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

if (getApps().length === 0) {
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID as string;
  const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL as string;
  const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY as string;
  const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET as string;

  if (!firebaseStorageBucket) {
    throw new Error("Missing FIREBASE_STORAGE_BUCKET in environment variables");
  }

  initializeApp({
    credential: cert({
      projectId: firebaseProjectId,
      clientEmail: firebaseClientEmail,
      privateKey: firebasePrivateKey?.replace(/\\n/g, "\n"),
    }),
    storageBucket: firebaseStorageBucket,
  });
}

const bucket = getStorage().bucket();

export { bucket };
