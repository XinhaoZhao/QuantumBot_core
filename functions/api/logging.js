const functions = require("firebase-functions");
const admin = require("../admin");

const logEvent = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {userId, eventType, eventDetails} = req.body;

  if (!userId || !eventType || !eventDetails) {
    return res.status(400).send("Bad Request: Missing required fields");
  }

  try {
    const logRef = admin.firestore().collection("logs").doc();
    await logRef.set({
      userId,
      eventType,
      eventDetails,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).send(`Event logged with ID: ${logRef.id}`);
  } catch (error) {
    console.error("Error logging event:", error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = logEvent;
