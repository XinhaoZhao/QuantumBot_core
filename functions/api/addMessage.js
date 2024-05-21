const functions = require("firebase-functions");
const admin = require("../admin");

const db = admin.firestore();

const addMessage = functions.https.onRequest(async (req, res) => {  
  console.log("Request received:", req.body);

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {userId, message} = req.body;

  if (!userId || !message) {
    return res.status(400).send("Bad Request: Missing userId or message");
  }

  try {
    const messageRef = db.collection("users").doc(
        userId).collection("messages").doc();
    await messageRef.set({
      text: message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Message added with ID:", messageRef.id);
    return res.status(200).send(`Message added with ID: ${messageRef.id}`);
  } catch (error) {
    console.error("Error adding message:", error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = addMessage;
