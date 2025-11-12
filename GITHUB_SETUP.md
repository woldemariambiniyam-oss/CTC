# GitHub Setup Instructions

## ✅ Repository Initialized

Your local git repository has been initialized and the initial commit has been created.

## 📤 Push to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `coffee-training-center` (or your preferred name)
3. Description: "Web-Based Training Center Management System for Coffee Training Center"
4. Choose: **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

### Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```powershell
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/coffee-training-center.git

# Rename main branch if needed (GitHub uses 'main' by default)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Alternative: Using SSH

If you have SSH keys set up with GitHub:

```powershell
git remote add origin git@github.com:YOUR_USERNAME/coffee-training-center.git
git branch -M main
git push -u origin main
```

## 🔒 Important: Sensitive Files

The following files are **NOT** committed (protected by .gitignore):
- ✅ `backend/.env` - Contains database passwords and API keys
- ✅ `node_modules/` - Dependencies (should be installed via npm)
- ✅ `qr-generator/venv/` - Python virtual environment
- ✅ `*.log` - Log files
- ✅ `uploads/` - User uploaded files

## 📝 What's Included

✅ All source code
✅ Documentation
✅ Configuration examples (env.example)
✅ Setup scripts
✅ Database schema
✅ README and guides

## 🔄 Future Updates

After making changes:

```powershell
git add .
git commit -m "Description of changes"
git push
```

## 📋 Repository Structure

```
coffee-training-center/
├── backend/          # Node.js/Express API
├── frontend/         # React.js application
├── database/         # MySQL schema
├── qr-generator/     # Python QR service
├── docs/            # Documentation
├── scripts/         # Setup scripts
└── README.md        # Project documentation
```

## 🎯 Next Steps

1. Create GitHub repository (see Step 1 above)
2. Push code (see Step 2 above)
3. Add repository description and topics on GitHub
4. Consider adding:
   - GitHub Actions for CI/CD
   - Issues template
   - Pull request template
   - Contributing guidelines

## 🔐 Security Reminder

**NEVER commit:**
- `.env` files
- API keys
- Passwords
- Database credentials
- Personal information

Always use `.env.example` files for configuration templates.

