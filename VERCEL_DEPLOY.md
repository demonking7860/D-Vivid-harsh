# Vercel Deployment Guide for D-Vivid Consultancy

## 🚀 Quick Deploy to Vercel

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `harshsingh6103/D-Vivid-Consultancy`
4. Vercel will auto-detect it as a Next.js project

### Step 2: Configure Environment Variables
Add these in Vercel's Environment Variables section:

#### **Required Variables** 🔥
```bash
NEXT_PUBLIC_APP_NAME=D-Vivid Consultancy
NEXT_PUBLIC_APP_DOMAIN=your-app-name.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
PERPLEXITY_API_KEY=pplx-YOUR_API_KEY_HERE
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
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

### Step 3: Update Clerk Dashboard
1. Go to [Clerk Dashboard](https://clerk.com)
2. Update allowed domains to include your Vercel URL
3. Update redirect URLs to match your new domain

### Step 4: Deploy
1. Click "Deploy" - Vercel will automatically build and deploy
2. Your app will be available at `https://your-project-name.vercel.app`

## ⚡ Auto-Deploy Configuration

- **Auto-deploys** from `main` branch
- **Preview deployments** for pull requests
- **Build Command**: `pnpm build`
- **Install Command**: `pnpm install`
- **Framework**: Next.js (auto-detected)

## 🔧 Build Configuration

- **Node Version**: 18.x (Vercel default)
- **Package Manager**: pnpm
- **Output Directory**: .next (auto-configured)
- **Function Timeout**: 60 seconds for API routes

## 📝 Environment Variables Checklist

- [ ] `NEXT_PUBLIC_APP_NAME`
- [ ] `NEXT_PUBLIC_APP_DOMAIN`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `PERPLEXITY_API_KEY` (Critical for AI features)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- [ ] All Clerk URL configurations

## 🚨 Critical Notes

1. **Puppeteer**: Configured to use Vercel's built-in Chrome
2. **API Timeouts**: Increased to 60 seconds for PDF generation
3. **Clerk Config**: Update Clerk dashboard with new Vercel domain
4. **HTTPS**: Vercel provides HTTPS by default
5. **Custom Domain**: Add your custom domain in Vercel settings if needed

## 🎯 Vercel Advantages

- ✅ **Zero Configuration**: Automatic Next.js detection
- ✅ **Global CDN**: Worldwide edge network
- ✅ **Serverless Functions**: Automatic scaling
- ✅ **Preview Deployments**: Test before merge
- ✅ **Analytics**: Built-in performance monitoring
- ✅ **Built-in Chrome**: Perfect for Puppeteer

## 📞 Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure API keys are valid
4. Update Clerk configuration with new domain

---

**🎉 Your D-Vivid Consultancy app will be live at: `https://your-project-name.vercel.app`**

## 🚀 Deploy Now

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fharshsingh6103%2FD-Vivid-Consultancy)