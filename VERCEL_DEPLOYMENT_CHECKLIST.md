# Vercel Deployment Checklist

## 🚨 URGENT: Security Issue Resolved

The Firebase private key exposure has been fixed in the code. Now you must rotate your credentials.

---

## Step 1: Rotate Firebase Credentials (CRITICAL)

### 1.1 Generate New Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Settings (⚙️)** → **Project Settings**
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file (keep it secure!)
7. The JSON will contain:
   - `project_id`
   - `client_email`
   - `private_key`

### 1.2 Optional: Revoke Old Service Account (Recommended)

Since the old key was exposed in build logs, you should revoke it:
1. In Firebase Console → IAM & Admin → Service Accounts
2. Find the compromised service account
3. Delete or disable it
4. Use the new service account you just created

---

## Step 2: Update Vercel Environment Variables

### 2.1 Navigate to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **nextjs-firebase-auth-fsce**
3. Click **Settings** → **Environment Variables**

### 2.2 Required Environment Variables

Check ALL these variables are set. Mark with ✅ as you verify each one:

#### Firebase Admin (Server-Side) - REQUIRED
- [ ] `FIREBASE_ADMIN_PROJECT_ID` = (from JSON: `project_id`)
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL` = (from JSON: `client_email`)
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY` = (from JSON: `private_key`)
  - **Format**: Must include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
  - **Important**: Vercel handles newlines automatically, paste the entire key as-is

#### Firebase Client (Browser-Side) - REQUIRED
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Firebase Client (Optional)
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (for Analytics)

#### Application Configuration - REQUIRED
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL` = (your admin email)
- [ ] `NEXT_PUBLIC_APP_URL` = `https://your-domain.vercel.app`

#### Optional Services
- [ ] `UPLOADTHING_SECRET` (if using UploadThing)
- [ ] `UPLOADTHING_APP_ID` (if using UploadThing)
- [ ] `NEXT_PUBLIC_MISTRAL_API_KEY` (if using Mistral AI)
- [ ] `NEXT_PUBLIC_EMAILJS_SERVICE_ID` (if using EmailJS)
- [ ] `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` (if using EmailJS)
- [ ] `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` (if using EmailJS)
- [ ] `NEXT_PUBLIC_FIREBASE_DYNAMIC_LINKS_PREFIX` (if using Dynamic Links)

### 2.3 Environment Scopes

For each variable, select which environments:
- ✅ **Production** (always)
- ✅ **Preview** (recommended for testing)
- ⬜ **Development** (optional, usually use local .env)

---

## Step 3: Verify Configuration Files

### 3.1 Check these files are committed:
- [ ] `package.json` (Node version should be `"node": "20.x"`)
- [ ] `vercel.json` (contains `--no-frozen-lockfile`)
- [ ] `lib/firebase-admin.ts` (no console.log of private key)

### 3.2 Run these commands locally to verify:
```bash
# Check git status
git status

# Verify latest commits
git log --oneline -5

# Ensure you're on the correct branch
git branch --show-current
```

---

## Step 4: Deploy to Vercel

### Option A: Trigger Automatic Deployment
```bash
# Make a small change to trigger deployment
git commit --allow-empty -m "chore: trigger Vercel deployment with updated credentials"
git push -u origin claude/setup-nextjs-firebase-auth-011nHB3CrnBN3zNNXx4UoGrh
```

### Option B: Manual Redeploy
1. Go to Vercel Dashboard → Deployments
2. Find the latest deployment
3. Click **⋯** (three dots) → **Redeploy**
4. Select **Use existing Build Cache** ⬜ (unchecked for fresh build)

---

## Step 5: Monitor Deployment

### 5.1 Watch the Build Logs
1. Click on the deployment in Vercel Dashboard
2. Click **Building** to see live logs
3. Look for these success indicators:
   ```
   ✓ Compiled successfully
   ✓ Generating static pages (61/61)
   Build Completed in /vercel/output
   Deploying outputs...
   ✓ Deployment ready
   ```

### 5.2 Common Issues to Watch For

#### If build fails with "Missing environment variables":
- Double-check all `FIREBASE_ADMIN_*` variables are set in Vercel
- Ensure there are no typos in variable names

#### If build succeeds but deployment hangs:
- Check Node version in package.json is `"20.x"` (not `">=18.0.0"`)
- Verify no large files are being deployed (check .vercelignore)

#### If you see private key in logs:
- **STOP IMMEDIATELY** - there's still a console.log somewhere
- Check all files in `lib/`, `app/lib/`, `app/lib/firebase/`, `app/lib/server/`

---

## Step 6: Verify Deployment

### 6.1 Test Authentication
1. Visit your deployed URL
2. Try to sign in
3. Check Firebase Authentication console for new sign-in

### 6.2 Test Admin Functions
1. Visit `/dashboard` (if logged in as admin)
2. Verify Firebase Admin SDK works (user management, etc.)

### 6.3 Check Browser Console
1. Open Developer Tools → Console
2. Should see NO Firebase errors
3. Should see NO authentication errors

---

## Step 7: Merge to Main (After Testing)

Once deployment is successful and tested:

```bash
# Create a pull request
gh pr create --title "fix: Resolve deployment issues and security vulnerabilities" --body "$(cat <<'EOF'
## Changes
- Fixed Firebase private key exposure
- Updated Node.js version to 20.x
- Updated environment variable naming
- Resolved Vercel deployment hanging issue

## Testing
- [x] Build completes successfully
- [x] Deployment completes without hanging
- [x] Authentication works
- [x] Admin functions work
- [x] No private key exposure in logs

## Security
- Rotated Firebase service account credentials
- Removed all console.log statements exposing secrets
EOF
)"
```

---

## Troubleshooting

### Issue: "FIREBASE_ADMIN_PROJECT_ID is not defined"
**Solution**: The environment variables in Vercel might still use old names. Either:
1. Add the new `FIREBASE_ADMIN_*` variables, OR
2. Update code to use old variable names (not recommended)

### Issue: "Error: Firebase Admin SDK private key is invalid"
**Solution**: Check the private key format:
- Should start with `-----BEGIN PRIVATE KEY-----`
- Should end with `-----END PRIVATE KEY-----`
- In Vercel, paste the entire key including headers
- Don't manually add `\n` - Vercel handles this

### Issue: Build succeeds but site shows 500 errors
**Solution**: Check Function Logs in Vercel:
1. Vercel Dashboard → Deployment → Functions
2. Look for runtime errors
3. Common cause: Missing or incorrect environment variables

---

## Summary Checklist

- [ ] New Firebase service account key generated
- [ ] Old service account revoked/disabled
- [ ] All environment variables updated in Vercel
- [ ] Latest code pushed to branch
- [ ] Deployment triggered and successful
- [ ] Site tested and working
- [ ] No secrets in build logs
- [ ] PR created and ready to merge

---

**Last Updated**: 2025-12-06
**Branch**: `claude/setup-nextjs-firebase-auth-011nHB3CrnBN3zNNXx4UoGrh`
