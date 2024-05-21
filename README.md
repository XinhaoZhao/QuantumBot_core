# QuantumBot_core_project

This project contains Firebase Cloud Functions for managing user sessions, adding messages, and logging events. It uses Firebase Authentication, Firestore, and JSON Web Tokens (JWT) for secure session handling.


## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-repo/firebase-session-management.git
   cd firebase-session-management
2. **Install dependencies:**
   ```sh
   cd functions
   npm install
3. **Set Firebase project:**
   ```sh
   firebase use --add
4. **Set JWT secret:**
   ```sh
   firebase functions:config:set jwt.secret="your_generated_jwt_secret"
5. **Initialize Firebase Admin SDK:**
   ```sh
    const admin = require("firebase-admin");

    if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com"  // Replace with your actual database URL
    });
    }

    module.exports = admin;

## Deployment
1. **Deploy functions to Firebase:**
   ```sh
   firebase deploy --only functions