# Remove System Posts Script

This script finds and removes posts in the Firestore database that are associated with the email "system@example.com".

## Important Note About Quota Limits

This script is designed to work with Firebase projects that may have strict quota limits. It includes:

- Exponential backoff retry logic
- Small batch sizes for queries and deletions
- Delays between operations to avoid hitting rate limits

If you encounter `RESOURCE_EXHAUSTED: Quota exceeded` errors, you may need to:

1. Upgrade your Firebase plan to get higher quotas
2. Run the script during off-peak hours
3. Increase the delay times in the script
4. Further reduce batch sizes

## Prerequisites

- Firebase project set up
- Firestore database configured
- Firebase Admin SDK credentials configured in your `.env.local` file with the following variables:
  - `FIREBASE_ADMIN_PROJECT_ID`
  - `FIREBASE_ADMIN_CLIENT_EMAIL`
  - `FIREBASE_ADMIN_PRIVATE_KEY`

## What This Script Does

1. Connects to your Firebase project using the Admin SDK
2. Searches for all posts where `authorEmail` is "system@example.com"
3. Displays the found posts with their details
4. Asks for confirmation before deleting the posts
5. Deletes the posts in batches (to handle large numbers of posts efficiently)

## Running the Script

```bash
# Using npm
npm run ts-node scripts/remove-system-posts.ts

# Using bun
bun run scripts/remove-system-posts.ts

# Using tsx
npx tsx scripts/remove-system-posts.ts
```

## Safety Features

- The script will display all posts that will be deleted before taking any action
- Confirmation is required before deletion occurs
- Posts are deleted in batches to handle large numbers efficiently
- Error handling is included to prevent partial deletions

## Caution

- This operation cannot be undone
- Make sure you have a backup of your database before running this script
- Verify that the posts displayed are the ones you want to delete before confirming

## Alternative Approach

If you continue to experience quota issues, consider using the Firebase Console directly:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database
4. Use the console's search functionality to find posts with `authorEmail` equal to "system@example.com"
5. Delete them manually through the console interface

This approach may be more reliable for small numbers of posts or when dealing with strict quota limits.
