import * as admin from "firebase-admin";

const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://playnite-3-complete-5032-aabb1-default-rtdb.firebaseio.com"
});

export const db = admin.firestore();
