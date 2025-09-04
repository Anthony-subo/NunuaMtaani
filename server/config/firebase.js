const admin = require("firebase-admin");
const path = require("path");

// Mounted secret file (Kubernetes / Docker secrets)
const serviceAccountPath = path.join("/etc/secrets", "serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  storageBucket: "autopartshub-847b5.appspot.com", // 👈 replace with your bucket
});

const bucket = admin.storage().bucket();

module.exports = bucket;
