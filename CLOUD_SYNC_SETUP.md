# Cloud Sync setup (one-time, ~2 minutes)

This connects the app to your own private GitHub repo so your phone and laptop
always see the same expenses. Your data never touches any other server —
only GitHub, using a token only you hold.

## Step 1 — Create the private data repo (if not done already)

1. Go to **github.com/new**
2. Repository name: `iExpense-data`
3. Set visibility to **Private**
4. Check "Add a README file"
5. Click **Create repository**

## Step 2 — Create an access token scoped to just that repo

1. Go to **github.com/settings/personal-access-tokens/new**
2. Under "Token name," enter something like `iExpense app`
3. Under "Expiration," pick whatever you're comfortable with (90 days, 1 year, or "No expiration" — you can always generate a new one later)
4. Under "Repository access," choose **Only select repositories** and pick `iExpense-data`
5. Under "Permissions" → "Repository permissions," find **Contents** and set it to **Read and write**
6. Scroll down and click **Generate token**
7. Copy the token GitHub shows you (starts with `github_pat_...`) — you won't be able to see it again after leaving the page

## Step 3 — Connect the app

1. Open the iExpense app
2. Scroll to the **Cloud Sync** section
3. Fill in:
   - **GitHub username**: your GitHub username
   - **Private data repo name**: `iExpense-data`
   - **Personal access token**: paste what you copied in Step 2
4. Tap **Connect & Sync**

That's it. The app will pull anything already in the cloud, merge in anything
already on this device, and push the combined result. Do this same connect
step on any other device (laptop, another phone) using the same token, and
they'll all read and write the same data from then on.

## If something goes wrong

- **"Connect failed" with a 404**: double-check the repo name is exactly
  `iExpense-data` and that it exists under the username you entered.
- **"Connect failed" with a 401/403**: the token is wrong, expired, or doesn't
  have write access to that repo — regenerate it (Step 2) and make sure
  "Contents: Read and write" is set.
- **Token expired later**: generate a new one (Step 2) and reconnect — your
  data in the repo is untouched, you're just replacing the key that opens it.
- **Want to stop syncing**: tap **Disconnect** in the Cloud Sync section. Your
  data stays on this device; the cloud copy is untouched.
