# 🌍 D-Vivid Consultant - Your Gateway to Global Education

<div align="center">
  <img src="/public/icons/logo.png" alt="D-Vivid Logo" width="80" height="80">
  
  **Empowering Students to Achieve Their International Education Dreams**
</div>

## 🌟 Introduction
D-Vivid Consultant is a comprehensive study abroad consultancy website designed to guide students through their international education journey. Built with cutting-edge technology including Next.js, Tailwind CSS, Aceternity UI, and Clerk authentication, this platform offers a seamless experience for students seeking overseas education opportunities.

## 🚀 Features

### 🎓 **Student Services**
- **University Guidance**: Expert advice on selecting the right international universities
- **Visa Assistance**: Complete visa application support and documentation
- **Scholarship Support**: Help finding and applying for international scholarships  
- **Test Preparation**: IELTS, TOEFL, GRE, and other standardized test preparation
- **Course Selection**: Personalized course recommendations based on career goals

### 🎨 **Visual Excellence**
- **Lamp Animation Effects**: Stunning animated lamp components for enhanced user experience
- **BackgroundBeams**: Dynamic animated background effects throughout the site
- **Card Spotlight**: Interactive service cards with hover effects
- **Smooth Scrolling**: Seamless navigation between sections
- **Typewriter Effects**: Engaging text animations in hero sections

### 🔐 **Authentication & Security**
- **Clerk Integration**: Secure user authentication and management
- **Protected Routes**: Secure access to consultation dashboards
- **User Profiles**: Personalized student dashboards

### 📱 **User Experience**
- **Responsive Design**: Optimized for all devices and screen sizes
- **Modern UI/UX**: Clean, professional interface with purple theme
- **Fast Loading**: Optimized performance with Next.js 14
- **SEO Optimized**: Search engine friendly architecture

## 🔗 Live Preview

Check out the live D-Vivid Consultant website: [Live Preview](https://d-vivid-consultant.vercel.app)

## 📍 Office Locations

### 📍 **Ahmedabad Office**
- **Address**: 123 Business Hub, Ahmedabad, Gujarat 380001
- **Phone**: +91 98765 43210
- **Email**: ahmedabad@d-vivid.com
- **Hours**: Mon-Sat: 9:00 AM - 7:00 PM

### 📍 **Surat Office**  
- **Address**: 456 Education Plaza, Surat, Gujarat 395007
- **Phone**: +91 98765 43211
- **Email**: surat@d-vivid.com
- **Hours**: Mon-Sat: 9:00 AM - 7:00 PM

## 💻 Tech Stack

### **Frontend**
- **Next.js 14.2.6** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

### **UI Components**
- **Shadcn UI** - Modern React component library
- **Aceternity UI** - Advanced UI components (Lamp, BackgroundBeams, CardSpotlight)
- **Lucide React** - Beautiful SVG icons

### **Authentication**
- **Clerk** - Complete authentication solution
- **Secure Routes** - Protected dashboard access

### **Styling & Animation**
- **Custom Purple Theme** - Brand-consistent color scheme
- **Responsive Design** - Mobile-first approach
- **Advanced Animations** - Lamp effects, particles, background beams

### **Development Tools**
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Git** - Version control

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- npm, pnpm, or yarn
- Git

### **Local Development**

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Rohantimoney/Study-Abroad.git
    cd Study-Abroad
    ```

2. **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    # or 
    yarn install
    ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
    ```env
    # App Configuration
    NEXT_PUBLIC_APP_NAME=D-Vivid Consultant
    NEXT_PUBLIC_APP_DOMAIN=http://localhost:3000

    # Database (if using Prisma)
    DATABASE_URL=your_database_url_here

    # Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_URL=/app
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_URL=/app
    ```

4. **Run the development server:**
    ```bash
    npm run dev
    # or
    pnpm dev
    # or
    yarn dev
    ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### **Production Build**

1. **Build the application:**
    ```bash
    npm run build
    ```

2. **Start the production server:**
    ```bash
    npm run start
    ```

## 🚀 Deployment

### **Deploy to Vercel (Recommended)**

1. **Push your code to GitHub**
2. **Connect your GitHub repository to Vercel**
3. **Add environment variables in Vercel dashboard**
4. **Deploy with one click**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Rohantimoney/Study-Abroad)

### **Environment Variables for Production**
Make sure to set these in your Vercel dashboard:
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_DOMAIN` 
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- All other Clerk-related variables

## 📁 Project Structure

```
Study-Abroad/
├── src/
│   ├── app/
│   │   ├── (main)/           # Main application pages
│   │   ├── (marketing)/      # Marketing pages
│   │   └── auth/             # Authentication pages
│   ├── components/
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components  
│   │   ├── global/           # Global components
│   │   ├── marketing/        # Marketing components
│   │   └── ui/               # UI components
│   ├── constants/            # Application constants
│   ├── functions/            # Utility functions
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Library configurations
│   └── styles/               # Global styles
├── public/
│   ├── fonts/                # Custom fonts
│   ├── icons/                # Application icons
│   └── images/               # Static images
└── prisma/                   # Database schema
```

## 🎯 Key Features Implemented

### **🎨 Visual Effects**
- ✅ Lamp animation in CTA sections
- ✅ BackgroundBeams in footer
- ✅ Card spotlight effects
- ✅ Particle animations  
- ✅ Typewriter effects in hero
- ✅ Smooth scrolling navigation

### **📱 Responsive Design**
- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop layouts
- ✅ Touch-friendly interactions

### **🔐 Authentication**
- ✅ Clerk integration
- ✅ Sign in/Sign up flows
- ✅ Protected routes
- ✅ User dashboard access

### **🌍 Study Abroad Content**
- ✅ University guidance services
- ✅ Visa assistance information
- ✅ Scholarship support details
- ✅ Test preparation services
- ✅ Student testimonials
- ✅ Office location details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 💬 Contact & Support

### **D-Vivid Consultant**
- **Website**: [d-vivid-consultant.vercel.app](https://d-vivid-consultant.vercel.app)
- **Email**: contact@d-vivid.com
- **Phone**: +91 98765 43210

### **Developer**
- **GitHub**: [Rohantimoney](https://github.com/Rohantimoney)
- **Issues**: [GitHub Issues](https://github.com/Rohantimoney/Study-Abroad/issues)

---

<div align="center">
  <p>Built with ❤️ for students pursuing international education</p>
  <p><strong>D-Vivid Consultant - Your Gateway to Global Education</strong></p>
</div>