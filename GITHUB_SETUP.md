# GitHub Shared Data Storage Setup

This guide will help you set up shared data storage using GitHub for your Interactive Map Project. This allows all users accessing your app to see each other's edits in real-time.

## Why GitHub?

- ✅ **100% Free** - No credit system, no costs
- ✅ **Professional Security** - Enterprise-grade data protection
- ✅ **Nonprofit Friendly** - Perfect for volunteer projects
- ✅ **Shared Storage** - All devices access the same data
- ✅ **Version Control** - Complete history of all changes

---

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in (create a free account if needed)
2. Click the **+** icon in the top right → **New repository**
3. Configure your repository:
   - **Repository name**: `map-project-data` (or any name you prefer)
   - **Description**: `Data storage for Interactive Map Project`
   - **Visibility**: Choose **Private** (recommended for security)
   - **Initialize**: Do NOT initialize with README
4. Click **Create repository**

## Step 2: Create Data Folder Structure

1. In your new repository, click **Add file** → **Create new file**
2. In the filename box, type: `data/locations.json`
3. Paste this content:
   ```json
   []
   ```
4. Click **Commit changes** (at the bottom)
5. Repeat steps 1-4 but create file: `data/config.json` with content:
   ```json
   {
     "title": "Interactive Map Project",
     "summary": "Explore organizations and services across the region."
   }
   ```

## Step 3: Generate GitHub Personal Access Token

1. Click your **profile icon** (top right) → **Settings**
2. Scroll down and click **Developer settings** (bottom left)
3. Click **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token** → **Generate new token (classic)**
5. Configure the token:
   - **Note**: `Interactive Map Project`
   - **Expiration**: Select "No expiration" (or your preferred duration)
   - **Select scopes**: Check these boxes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `contents` (Write access to content)
6. Click **Generate token** at the bottom
7. **IMPORTANT**: Copy the token immediately (you won't see it again!)
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Paste it somewhere safe temporarily

## Step 4: Configure Your App

1. Open your Interactive Map Project in the browser
2. Login to **Admin Mode** (click "Unlock Admin Mode")
3. Scroll down and find the **"GitHub Data Storage Setup"** section
4. Fill in the fields:
   - **GitHub Username**: Your GitHub username (e.g., `your-github-username`)
   - **GitHub Repository**: The repo you created (e.g., `map-project-data`)
   - **GitHub Personal Access Token**: Paste the token from Step 3
   - **Branch**: Keep as `main` (unless you created a different branch)
5. Click **Save GitHub Config**
6. You should see: ✓ "GitHub storage is configured"

## Step 5: Test It!

1. **You**: Add a location through the form → Click "Save Location"
2. **Kara**: Open the link in her browser
3. **Kara**: Go to Admin Mode and scroll down to see your location in the list
4. **Kara**: Add a different location
5. **You**: Refresh your browser → You should see Kara's location!

---

## How It Works

- When you save/edit/delete a location → Data is saved to GitHub's `data/locations.json` file
- When someone loads the app → It reads from GitHub
- All changes are tracked in your GitHub repository's history
- If GitHub is unreachable → App falls back to browser storage (no data loss)

---

## Security Notes

- ✅ Your token is stored in **browser storage** on YOUR device only (not sent to any server)
- ✅ The GitHub repository is **private** (only people with the link can't access it)
- ✅ You can **revoke** the token anytime from GitHub Settings
- ✅ For a nonprofit: GitHub's free tier is fully supported

---

## If Something Goes Wrong

**"GitHub storage is not configured yet"**
- Make sure all fields are filled in
- Double-check your GitHub username and repository name
- Verify the token is correct (copy it again if needed)

**"Could not load from GitHub"**
- Check your internet connection
- Verify the repository name is correct
- Check that the `data/` folder exists in your repository

**Can't see edits from other users**
- Try refreshing the page
- Make sure the other person has saved their changes
- Check that both people are using the same GitHub config

---

## Next Steps (Optional)

To automate this setup for new users, you could add a setup wizard in the app, but the manual setup above is a one-time task per admin.

For help, check the setup guide embedded in the Admin Mode section.
