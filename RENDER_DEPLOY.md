# Render Deployment Guide for D-Vivid Consultancy

## 🚀 Quick Deploy to Render

### Step 1: Connect Repository
1. Go to [Render Dashboard](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `harshsingh6103/D-Vivid-Consultancy`

### Step 2: Configure Build Settings
```bash
Build Command: pnpm install && pnpm build
Start Command: pnpm start
Environment: Node.js
Node Version: 18.x
```

### Step 3: Set Environment Variables
Add these in Render Environment tab:

#### **Required Variables** 🔥
```bash
NEXT_PUBLIC_APP_NAME=D-Vivid Consultancy
NEXT_PUBLIC_APP_DOMAIN=your-app-name.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
PERPLEXITY_API_KEY=pplx-YOUR_API_KEY_HERE
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

#### **Clerk Auth URLs** 🔐
```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_URL=/app
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

#### **Optional SEO Variables** 📈
```bash
NEXT_PUBLIC_AUTHOR_NAME=D-Vivid Consultancy Team
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code
NEXT_PUBLIC_YANDEX_VERIFICATION=your_verification_code
NEXT_PUBLIC_YAHOO_VERIFICATION=your_verification_code
```

### Step 4: Update Domain References
Replace `your-app-name.onrender.com` with your actual Render service URL

### Step 5: Update Clerk Dashboard
1. Go to [Clerk Dashboard](https://clerk.com)
2. Update allowed domains to include your Render URL
3. Update redirect URLs to match your new domain

## ⚡ Auto-Deploy Configuration

The `render.yaml` file is configured for automatic deployments from the `main` branch.

## 🔧 Build Configuration

- **Node Version**: 18.17.0
- **Package Manager**: pnpm
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

## 📝 Environment Variables Checklist

- [ ] `NEXT_PUBLIC_APP_NAME`
- [ ] `NEXT_PUBLIC_APP_DOMAIN`  
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `PERPLEXITY_API_KEY` (Critical for AI features)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] All Clerk URL configurations

## 🚨 Critical Notes

1. **API Keys**: Use your own Perplexity API key for assessment functionality
2. **Clerk Config**: Update Clerk dashboard with new domain
3. **HTTPS**: Render provides HTTPS by default
4. **Domain**: Use `.onrender.com` domain provided by Render

## 📞 Support

If deployment fails, check:
1. Build logs in Render dashboard
2. Environment variables are set correctly  
3. API keys are valid
4. Clerk configuration matches new domain

---

**🎉 Your D-Vivid Consultancy app will be live at: `https://your-app-name.onrender.com`**