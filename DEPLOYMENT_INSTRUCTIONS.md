# Deployment Instructions for Vercel

You're encountering an error during deployment because your `pnpm-lock.yaml` file is out of sync with your `package.json` file. Here's how to fix it:

## Option 1: Update the lock file locally

1. Run the following command in your project directory:
   ```bash
   pnpm install --no-frozen-lockfile
   ```

2. Commit the updated lock file:
   ```bash
   git add pnpm-lock.yaml
   git commit -m "Update pnpm-lock.yaml to match package.json"
   git push
   ```

3. Deploy again on Vercel

## Option 2: Update vercel.json (Already Done)

I've updated your `vercel.json` file to include the `--no-frozen-lockfile` flag in the install command. This should allow Vercel to install dependencies without requiring an exact match with the lock file.

The updated file looks like this:
```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "framework": "nextjs",
  "devCommand": "pnpm run dev"
}
```

Just commit and push this change:
```bash
git add vercel.json
git commit -m "Update vercel.json to use --no-frozen-lockfile"
git push
```

## Option 3: Use Vercel Dashboard Settings

You can also configure this in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Click on "Settings"
3. Go to the "Build & Development Settings" section
4. Change the "Install Command" to `pnpm install --no-frozen-lockfile`
5. Click "Save"

Choose the option that works best for you. Option 2 (updating vercel.json) is already done, so you just need to commit and push that change.
