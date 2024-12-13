const admin = require('firebase-admin');
const serviceAccount = require('../fsce-2024-firebase-adminsdk-hvhpp-4f942b32f6.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// The users to create and make admins
const adminUsers = [
  {
    email: 'dev.yosef@gmail.com',
    password: 'Admin123!@#',
    displayName: 'Dev Yosef'
  },
  {
    email: 'yaredd.degefu@gmail.com',
    password: 'Admin123!@#',
    displayName: 'Yared Degefu'
  }
];

async function createAndSetAdminUsers() {
  try {
    for (const userData of adminUsers) {
      try {
        // Try to create the user
        const userRecord = await admin.auth().createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true
        });
        console.log(`Successfully created user: ${userData.email}`);
        
        // Set admin custom claim
        await admin.auth().setCustomUserClaims(userRecord.uid, {
          admin: true
        });
        console.log(`Successfully set admin claim for user ${userData.email}`);
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          // If user exists, get their UID and set admin claim
          const user = await admin.auth().getUserByEmail(userData.email);
          await admin.auth().setCustomUserClaims(user.uid, {
            admin: true
          });
          console.log(`User ${userData.email} already exists, updated admin claims`);
        } else {
          console.error(`Error processing user ${userData.email}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

createAndSetAdminUsers();
