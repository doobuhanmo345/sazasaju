import admin from 'firebase-admin';

if (!admin.apps.length) {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
            });
            console.log('✅ Firebase Admin initialized successfully');
        } catch (error) {
            console.error('❌ Firebase admin initialization error:', error);
        }
    } else {
        console.warn('⚠️ Firebase Admin Environment Variables missing. Skipping initialization.');
    }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
export default admin;