// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "autopartshub-847b5.appspot.com" // ✅ note: must end with .appspot.com
});

const bucket = admin.storage().bucket();
module.exports = bucket;
