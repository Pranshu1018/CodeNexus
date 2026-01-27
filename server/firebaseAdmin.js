import admin from "firebase-admin";
import { readFile } from "fs/promises";

// Read the JSON file manually
const serviceAccount = JSON.parse(
    await readFile(new URL("./serviceAccountKey.json", import.meta.url))
);


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://your-project-id.firebaseio.com" // Optional, for RTDB
});

const db = admin.firestore(); // Firestore instance
export {db}