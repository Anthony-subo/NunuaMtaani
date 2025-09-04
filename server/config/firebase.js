const admin = require("firebase-admin");
const path = require("path");

// Point to the mounted secret file
const serviceAccountPath = path.join("/etc/secrets", "serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  storageBucket: "autopartshub-847b5.appspot.com", // 👈 your Firebase bucket
});

const bucket = admin.storage().bucket();

module.exports = bucket;
