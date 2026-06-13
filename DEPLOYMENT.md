# 🚀 Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- ✅ All environment variables configured
- ✅ Firebase project in production mode
- ✅ Razorpay account (production keys)
- ✅ All API keys for third-party services

---

## 📦 Backend Deployment (Server)

### Option 1: Render

1. **Create New Web Service** on [Render](https://render.com)
2. **Connect your repository**
3. **Configure Build Settings:**
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && node server.js`
   - **Root Directory:** `server`

4. **Environment Variables** (Add in Render Dashboard):
   ```
   PORT=8000
   NODE_ENV=production
   JWT_SECRET=your-strong-jwt-secret
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=your_live_secret
   GEN_AI_SECRET=your-google-ai-key
   GROQ_API_KEY=your-groq-key
   ZENROWS_API_KEY=your-zenrows-key
   FIREBASE_API_KEY=your-firebase-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-bucket
   FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   FIREBASE_APP_ID=your-app-id
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

5. **Deploy** - Your backend will be available at `https://your-app.onrender.com`

### Option 2: Railway

1. **Create New Project** on [Railway](https://railway.app)
2. **Deploy from GitHub**
3. **Set Root Directory:** `server`
4. **Add environment variables** (same as above)
5. **Deploy**

---

## 🌐 Frontend Deployment (Client)

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Update `.env` in client folder:**
   ```env
   VITE_API_URL=https://your-backend-domain.onrender.com
   VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
   VITE_RAPIDAPI_KEY=your-key
   VITE_FIREBASE_API_KEY=your-firebase-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

3. **Deploy:**
   ```bash
   cd client
   vercel
   ```

4. **Configure Environment Variables** on Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`

5. **Redeploy** after adding environment variables

### Option 2: Netlify

1. **Connect Repository** on [Netlify](https://netlify.com)
2. **Build Settings:**
   - **Base Directory:** `client`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `client/dist`

3. **Environment Variables:**
   - Go to Site Settings → Build & Deploy → Environment
   - Add all `VITE_*` variables

4. **Deploy**

---

## 🔧 Post-Deployment Configuration

### 1. Update CORS Origins

After frontend deployment, update backend `.env`:
```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.netlify.app
```

Redeploy backend service.

### 2. Update Razorpay Webhook

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Webhooks**
3. Add webhook URL: `https://your-backend.onrender.com/webhook`
4. Enable events: `payment.captured`, `payment.failed`

### 3. Firebase Security Rules

Update Firestore rules for production:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /mentors/{mentorId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'instructor';
    }
    match /chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid in resource.data.participants;
    }
    match /calls/{callId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Test Payment Flow

1. Use Razorpay **test mode** first
2. Test a complete payment flow
3. Verify payment validation works
4. Switch to **live mode** for production

---

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-xx-xxTxx:xx:xx.xxxZ",
  "services": {
    "razorpay": true,
    "gemini": true,
    "groq": true
  }
}
```

### Frontend Check
1. Open `https://your-frontend.vercel.app`
2. Check browser console for errors
3. Test key features:
   - Login/Signup
   - Course browsing
   - Payment flow
   - Mentor chat
   - Resume builder

---

## 📊 Monitoring

### Backend Logs
- **Render:** Dashboard → Logs
- **Railway:** Dashboard → Deployments → Logs

### Frontend Logs
- **Vercel:** Project → Deployments → Function Logs
- **Netlify:** Site → Deploys → Deploy Log

---

## 🔒 Security Checklist

- [ ] All API keys in environment variables (not hardcoded)
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Using HTTPS for all connections
- [ ] Razorpay keys are LIVE mode (not test)
- [ ] Firebase security rules updated
- [ ] CORS configured for production domains only
- [ ] `.env` files not committed to git
- [ ] Rate limiting enabled on backend
- [ ] Input validation on all endpoints

---

## 🆘 Troubleshooting

### Payment Not Working
- Verify Razorpay keys are correct
- Check CORS settings allow frontend domain
- Ensure backend `/order` endpoint is accessible
- Check Razorpay dashboard for payment logs

### Firebase Connection Issues
- Verify Firebase config is correct
- Check Firebase project is not in quota limit
- Ensure Firestore security rules allow access

### API Calls Failing
- Check `VITE_API_URL` points to correct backend
- Verify backend is running and accessible
- Check CORS headers in backend

---

## 📝 Quick Deploy Commands

```bash
# Backend (from project root)
cd server && npm install && node server.js

# Frontend (from project root)  
cd client && npm install && npm run build

# Full deployment test locally
npm run dev  # If you have a root package.json script
```

---

## 🎉 Post-Launch

1. Monitor error logs for first 24 hours
2. Test all critical user flows
3. Set up error tracking (Sentry, LogRocket)
4. Enable analytics (Google Analytics, Mixpanel)
5. Create backup strategy for Firebase data

---

## 📞 Support

If you encounter deployment issues:
1. Check environment variables are set correctly
2. Review server logs for errors
3. Verify all services (Firebase, Razorpay) are configured
4. Test locally with production environment variables

---

**Your app is now ready for deployment!** 🚀
