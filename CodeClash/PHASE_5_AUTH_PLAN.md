# 🔐 Phase 5: Authentication System - Implementation Plan

## ✅ What We're Building:

### 1. Authentication Features:
- Sign In page with email/password
- Sign Up page with email/password
- Google OAuth login
- GitHub OAuth login
- Protected routes (AI generator requires login)
- Session management

### 2. User Tracking:
- Track which user created which problem
- User dashboard showing their problems
- Problem ownership & permissions

### 3. Backend Updates:
- Add `created_by` field to Problem model
- User authentication endpoints
- Protected API routes

---

## 📋 Setup Required:

### Google OAuth Setup:
1. Go to: https://console.cloud.google.com/
2. Create new project "CodeClash"
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID & Secret

### GitHub OAuth Setup:
1. Go to: https://github.com/settings/developers
2. New OAuth App
3. Name: CodeClash
4. Homepage: `http://localhost:3000`
5. Callback: `http://localhost:3000/api/auth/callback/github`
6. Copy Client ID & Secret

---

## 🔧 Implementation Steps:

### Frontend (Next.js):
1. ✅ Install next-auth (DONE)
2. Create auth API route
3. Create sign in page
4. Create sign up page
5. Add auth provider wrapper
6. Protect /admin/generate route
7. Add user dashboard

### Backend (Django):
1. Add User model integration
2. Add `created_by` to Problem model
3. Create user registration endpoint
4. Create login endpoint
5. Add JWT authentication
6. Protect AI endpoints

---

## ⚠️ Important Notes:

### For Now (MVP):
- Using NextAuth.js on frontend
- Simple email/password + OAuth
- Backend will validate via JWT
- Quick to implement

### Future (Production):
- Move to full Django auth
- Or keep NextAuth + sync with Django
- Your choice!

---

## 🚀 Let's Start!

I'll create:
1. NextAuth configuration
2. Sign in/up pages
3. Protected routes
4. User dashboard

Then you can add OAuth keys when ready!

**Ready to proceed?**

I'll build the complete auth system now. It'll work with email/password immediately, and you can add Google/GitHub keys later!
