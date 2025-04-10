# Firebase REST API Solution for Quota Exceeded Issues

When both the Firebase Console and Admin SDK are hitting quota limits, this alternative approach uses the Firebase REST API directly to find and delete posts.

## How This Solution Works

This script:
1. Uses direct HTTP requests to the Firebase REST API
2. Bypasses the Admin SDK and Firestore client libraries
3. Uses very small batch sizes and long delays between operations
4. Implements exponential backoff for error handling

## Prerequisites

- Node.js installed
- Your Firebase project ID
- A Firebase Web API key (from Project Settings)
- Your Firebase account email and password

## Setup Instructions

1. Open the `rest-api-remove-posts.js` file
2. Fill in the configuration values at the top of the file:
   ```javascript
   const PROJECT_ID = ''; // Your Firebase project ID
   const API_KEY = '';    // Your Firebase API key (web API key from Project Settings)
   const EMAIL = '';      // Your Firebase account email
   const PASSWORD = '';   // Your Firebase account password
   ```

## Running the Script

```bash
node scripts/rest-api-remove-posts.js
```

The script will:
1. Authenticate with Firebase
2. Search for posts with "system@example.com" email
3. Display the found posts
4. Ask for confirmation before deletion
5. Delete the posts one by one with delays between operations

## Troubleshooting

If you still encounter quota issues:

1. **Increase delays**: Modify the `sleep()` durations in the script
2. **Reduce batch size**: Change the `limit` value in the `queryPosts` function
3. **Run during off-peak hours**: Firebase quotas often reset daily
4. **Contact Firebase Support**: If you're on a paid plan, contact support for quota increases

## Security Warning

This script requires your Firebase email and password. Never share the script with these values filled in, and consider deleting the credentials after use.

## Alternative: Firebase Console via REST API

If you need to access Firestore data but the console is showing "Quota exceeded", you can use this REST API approach to build a simple viewer:

```javascript
// Example: List all collections
const options = {
  hostname: 'firestore.googleapis.com',
  path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

// Make the request as shown in the main script
```
