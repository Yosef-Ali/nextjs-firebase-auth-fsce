# Cloud-Based Solution for Removing System Posts

When facing severe quota limitations in Firebase, running scripts locally may not be feasible. This document outlines how to deploy and run the post removal script in a cloud environment where quota limits are typically more generous.

## Option 1: Deploy as a Google Cloud Function

This is the simplest approach and requires minimal setup.

### Prerequisites

- Google Cloud account (same project as your Firebase project)
- `gcloud` CLI installed and configured

### Deployment Steps

1. **Prepare the function for deployment**

   Create a `package.json` file in the same directory as the script:

   ```json
   {
     "name": "remove-system-posts",
     "version": "1.0.0",
     "description": "Remove posts with system@example.com email",
     "main": "cloud-remove-system-posts.js",
     "dependencies": {
       "firebase-admin": "^11.0.0"
     }
   }
   ```

2. **Deploy the function to Google Cloud**

   ```bash
   gcloud functions deploy removeSystemPosts \
     --runtime nodejs16 \
     --trigger-http \
     --allow-unauthenticated
   ```

3. **Run the function**

   After deployment, you'll receive a URL. Visit this URL in your browser or use curl to trigger the function:

   ```bash
   curl https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/removeSystemPosts
   ```

## Option 2: Run in Google Cloud Shell

If you don't want to deploy a function, you can run the script directly in Google Cloud Shell.

1. **Open Google Cloud Shell**

   Go to [Google Cloud Console](https://console.cloud.google.com/) and click the Cloud Shell icon (>_) in the top right.

2. **Upload the script**

   Click the three-dot menu in Cloud Shell and select "Upload file". Upload the `cloud-remove-system-posts.js` file.

3. **Install dependencies and run**

   ```bash
   npm init -y
   npm install firebase-admin
   node cloud-remove-system-posts.js
   ```

## Option 3: Run in a Docker Container on Cloud Run

For a more robust solution that can run for longer periods:

1. **Create a Dockerfile**

   ```dockerfile
   FROM node:16-slim
   WORKDIR /app
   COPY cloud-remove-system-posts.js package.json ./
   RUN npm install
   CMD ["node", "cloud-remove-system-posts.js"]
   ```

2. **Build and deploy to Cloud Run**

   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/remove-system-posts
   gcloud run deploy remove-system-posts \
     --image gcr.io/YOUR_PROJECT_ID/remove-system-posts \
     --platform managed
   ```

## Monitoring and Logs

Regardless of which method you choose, you can monitor the execution and view logs in the Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to the appropriate service (Cloud Functions or Cloud Run)
3. Select your function/service
4. Click on "Logs" to view the execution logs

## Troubleshooting

- **Authentication Issues**: Make sure your cloud environment has the necessary permissions to access Firestore
- **Timeouts**: Cloud Functions have execution time limits (9 minutes for HTTP functions). If you have many posts, consider using Cloud Run instead
- **Quota Issues**: Even in the cloud, you might hit quotas. The script includes delays to mitigate this, but you may need to adjust them

## Security Considerations

- The deployment commands above create publicly accessible endpoints
- For production use, add authentication to your function/service
- Consider using service accounts with minimal required permissions
