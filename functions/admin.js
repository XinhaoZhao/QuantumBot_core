const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://practice-2bbf0.firebaseio.com",
  });
}

module.exports = admin;
