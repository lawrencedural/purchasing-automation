# GitHub Upload Guide - Trim Ordering Automation

Complete guide to upload your project to GitHub.

## 📋 Prerequisites

- Git installed on your computer
- GitHub account created
- Project files ready

---

## 🚀 Step-by-Step Guide

### Step 1: Install Git (if not installed)

**Check if Git is installed:**
```bash
git --version
```

**If not installed, download from:**
https://git-scm.com/downloads

---

### Step 2: Initialize Git Repository

Open your terminal/command prompt in the project folder:

```bash
cd "C:\Users\macky\OneDrive\Documents\Github-Projects\New folder\Purchasing-Automation"
```

**Initialize Git:**
```bash
git init
```

---

### Step 3: Configure Git (First time only)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

### Step 4: Add Files to Git

**Add all files:**
```bash
git add .
```

**Check what's being added:**
```bash
git status
```

---

### Step 5: Create First Commit

```bash
git commit -m "Initial commit: Trim Ordering Automation System"
```

---

### Step 6: Create GitHub Repository

1. Go to https://github.com
2. Sign in to your account
3. Click the **"+" icon** (top right)
4. Select **"New repository"**
5. Fill in details:
   - **Repository name**: `purchasing-automation`
   - **Description**: "Automated trim ordering workflow system with React frontend and FastAPI backend"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have files)
6. Click **"Create repository"**

---

### Step 7: Connect Local Repository to GitHub

GitHub will show you commands. Copy the commands from your new repository page and run:

```bash
git remote add origin https://github.com/your-username/repository-name.git
```

Replace `your-username` and `repository-name` with your actual values.

**Example:**
```bash
git remote add origin https://github.com/macky/trim-ordering-automation.git
```

---

### Step 8: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (see below)

---

## 🔐 Authentication Setup

GitHub no longer accepts passwords. You need a Personal Access Token:

### Create Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: "Local Development"
4. Select scopes: Check **repo** (full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again)
7. Use this token as your password when pushing

**Or use GitHub Desktop:**
- Download GitHub Desktop: https://desktop.github.com/
- Sign in
- Use GUI to push files

---

## 📦 What Gets Uploaded

The `.gitignore` file ensures these files are uploaded:

### ✅ Included:
- All documentation files (`.md`)
- Frontend code (`frontend/src/`)
- Backend code (`backend/`)
- Configuration files (`package.json`, `requirements.txt`, etc.)
- Docker files (`Dockerfile`, `docker-compose.yml`)
- Application files (`App.jsx`, `main.py`, etc.)

### ❌ Excluded:
- `node_modules/` (dependencies)
- `.env` (environment variables)
- `logs/` (log files)
- `__pycache__/` (Python cache)
- `dist/` (build output)
- `.git/` (Git files)
- Uploaded files (`.xlsx`, `.csv`)

---

## 🔄 Updating Your Repository

After making changes, repeat these commands:

```bash
git add .
git commit -m "Describe your changes"
git push
```

**Example commit messages:**
```bash
git commit -m "Add file upload feature"
git commit -m "Fix search functionality"
git commit -m "Update documentation"
```

---

## 🌿 Using Branches (Advanced)

**Create a new branch:**
```bash
git checkout -b feature/new-feature
```

**Switch branches:**
```bash
git checkout main
git checkout feature/new-feature
```

**Push new branch:**
```bash
git push -u origin feature/new-feature
```

---

## 📝 Recommended Repository Structure

Your GitHub repository should look like this:

```
trim-ordering-automation/
├── .gitignore
├── README.md
├── README_APPLICATION.md
├── SETUP_GUIDE.md
├── HOW_IT_WORKS.md
├── GITHUB_UPLOAD_GUIDE.md (this file)
├── SYSTEM_ARCHITECTURE.md
├── IMPLEMENTATION_GUIDE.md
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
├── start_backend.bat
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/
    ├── main.py
    └── requirements.txt
```

---

## 🔧 Troubleshooting

### Error: "Repository not found"
- Check repository name and username
- Verify you have access to the repository

### Error: "Permission denied"
- Generate new Personal Access Token
- Update Git credentials

### Error: "Branch is ahead"
- Pull latest changes first:
  ```bash
  git pull origin main
  ```
- Then push:
  ```bash
  git push
  ```

### Want to start over?
```bash
# Remove Git history
rm -rf .git
git init
git add .
git commit -m "Fresh start"
git remote add origin https://github.com/username/repo.git
git push -u origin main --force
```

---

## 📚 Alternative: GitHub Desktop

If you prefer a visual interface:

### Install GitHub Desktop:
1. Download: https://desktop.github.com/
2. Install and sign in
3. Open repository folder
4. Click "Publish repository"
5. Choose name and visibility
6. Click "Publish repository"

---

## 🎯 Quick Command Reference

```bash
# Initialize
git init

# Add files
git add .

# Commit changes
git commit -m "Your message"

# Connect to GitHub
git remote add origin https://github.com/username/repo.git

# Push to GitHub
git push -u origin main

# Check status
git status

# View history
git log

# Update repository
git add .
git commit -m "Update description"
git push
```

---

## 📝 Good Commit Messages

Write clear, descriptive commit messages:

✅ Good examples:
```
git commit -m "Add file upload functionality"
git commit -m "Fix search filter bug"
git commit -m "Update README with setup instructions"
git commit -m "Add tech pack data entry form"
```

❌ Bad examples:
```
git commit -m "changes"
git commit -m "update"
git commit -m "fix"
```

---

## 🔗 After Uploading

### Update README with Link

Add this to your README.md:

```markdown
## 🌐 Live Version

Check out the live application: [Link to your deployment]

## 📦 GitHub Repository

View the source code: https://github.com/your-username/trim-ordering-automation
```

---

## 🎉 Next Steps After Upload

1. ✅ Add description to repository
2. ✅ Add topics/tags (react, fastapi, automation)
3. ✅ Add a license file
4. ✅ Enable GitHub Pages (optional)
5. ✅ Set up GitHub Actions (optional)
6. ✅ Add collaborators (optional)

---

## 💡 Pro Tips

1. **Regular Commits**: Commit often with clear messages
2. **Pull Before Push**: Always pull before pushing when working with others
3. **Use Branches**: Create branches for new features
4. **Review Changes**: Use `git diff` to review changes before committing
5. **Backup**: GitHub is your backup!

---

## 📞 Need Help?

**GitHub Documentation:**
- https://docs.github.com/en/get-started

**Git Documentation:**
- https://git-scm.com/doc

**Common Issues:**
- Check GitHub Status: https://www.githubstatus.com/
- Community Support: https://github.community/

---

## ✅ Checklist

Before uploading, make sure:
- [ ] All files are ready
- [ ] .gitignore is in place
- [ ] No sensitive data in files
- [ ] Documentation is complete
- [ ] README has project description
- [ ] Git is configured
- [ ] GitHub account is ready
- [ ] Personal Access Token created (if needed)

---

**You're ready to upload to GitHub! 🚀**

Follow the steps above, and your project will be on GitHub in minutes!

