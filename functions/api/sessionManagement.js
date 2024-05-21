const functions = require("firebase-functions");
const admin = require("../admin");
const jwt = require("jsonwebtoken");

// Retrieve JWT secret from environment variables
const JWT_SECRET = functions.config().jwt.secret;

const db = admin.firestore();

const createSession = functions.https.onRequest(async (req, res) => {
  console.log("Request received:", req.body);

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {uid} = req.body;

  if (!uid) {
    return res.status(400).send("Bad Request: Missing user ID");
  }

  try {
    // Create custom token for Firebase Authentication
    const additionalClaims = {premiumAccount: true};
    const customToken = await admin.auth().createCustomToken(
        uid, additionalClaims,
    );
    console.log("Custom token created:", customToken);

    // Create temporary JWT token
    const jwtToken = jwt.sign(
        {uid, additionalClaims}, JWT_SECRET, {expiresIn: "1h"},
    );
    console.log("JWT token created:", jwtToken);

    // Store JWT token in Firestore with expiration timestamp
    const expiration = admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 3600 * 1000),
    ); // 1 hour from now
    await db.collection("sessions").doc(uid).set({jwtToken, expiration});

    return res.status(200).send({jwtToken});
  } catch (error) {
    console.error("Error creating session:", error);
    return res.status(500).send("Internal Server Error");
  }
});

const verifySession = functions.https.onRequest(async (req, res) => {
  console.log("Request received for session verification");

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {token} = req.body;

  if (!token) {
    return res.status(400).send("Bad Request: Missing token");
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified:", decoded);

    // Check token validity in Firestore
    const sessionDoc = await db.collection("sessions").doc(
        decoded.uid,
    ).get();
    if (!sessionDoc.exists) {
      return res.status(401).send("Unauthorized: Invalid token");
    }

    const {jwtToken, expiration} = sessionDoc.data();
    if (token !== jwtToken || expiration.toDate() < new Date()) {
      return res.status(401).send("Unauthorized: Token expired or invalid");
    }

    return res.status(200).send({message: "Session verified", decoded});
  } catch (error) {
    console.error("Error verifying session:", error);
    return res.status(401).send("Unauthorized: Invalid token");
  }
});

const deleteSession = functions.https.onRequest(async (req, res) => {
  console.log("Request received to delete session");

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {uid} = req.body;

  if (!uid) {
    return res.status(400).send("Bad Request: Missing user ID");
  }

  try {
    // Revoke refresh tokens for a specified user
    await admin.auth().revokeRefreshTokens(uid);
    console.log(`Revoked tokens for user: ${uid}`);

    // Delete session token from Firestore
    await db.collection("sessions").doc(uid).delete();

    return res.status(200).send(
        {message: `Session deleted for user: ${uid}`},
    );
  } catch (error) {
    console.error("Error deleting session:", error);
    return res.status(500).send("Internal Server Error");
  }
});

const logout = functions.https.onRequest(async (req, res) => {
  console.log("Request received to logout");

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const {token} = req.body;

  if (!token) {
    return res.status(400).send("Bad Request: Missing token");
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified for logout:", decoded);

    // Delete session token from Firestore
    await db.collection("sessions").doc(decoded.uid).delete();

    return res.status(200).send({message: "Logout successful"});
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = {
  createSession,
  verifySession,
  deleteSession,
  logout,
};
