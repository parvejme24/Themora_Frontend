# 🚀 Themora - Modern Template Marketplace

<div align="center">

![Themora Logo](https://img.shields.io/badge/Themora-Template%20Marketplace-blue?style=for-the-badge&logo=react)

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-green?style=for-the-badge)](https://techfynite.vercel.app)
[![GitHub](https://img.shields.io/badge/📱_GitHub-View_Code-black?style=for-the-badge&logo=github)](https://github.com/yourusername/techfynite-frontend)

</div>


## 🎯 Overview

**Themora** is a modern, full-stack template marketplace built with cutting-edge technologies. It provides a seamless platform for developers to discover, purchase, and download premium web templates. The application features a comprehensive admin dashboard, user authentication, payment processing, and a beautiful responsive design.

### 🎯 Key Highlights

- **🛒 E-commerce Platform**: Complete template marketplace with shopping cart and checkout
- **👨‍💼 Admin Dashboard**: Full CRUD operations for templates, users, and content management
- **🔐 Authentication**: Secure user authentication with Firebase
- **💳 Payment Integration**: LemonSqueezy payment processing
- **📱 Responsive Design**: Mobile-first approach with beautiful UI/UX
- **⚡ Performance**: Optimized for speed with Next.js 15 and modern React patterns

---

## ✨ Features

### 🛍️ **User Features**
- 🔍 **Advanced Search & Filtering**: Find templates by category, price, and features
- 🛒 **Shopping Cart**: Add templates to cart with quantity management
- 💳 **Secure Checkout**: Integrated payment processing with LemonSqueezy
- 📧 **Email Delivery**: Automatic template delivery via email
- 👤 **User Dashboard**: Track purchases and manage account
- 📱 **Responsive Design**: Perfect experience on all devices

### 👨‍💼 **Admin Features**
- 📊 **Analytics Dashboard**: Revenue charts, user statistics, and performance metrics
- 🎨 **Template Management**: Create, edit, and manage template listings
- 👥 **User Management**: Manage user accounts and permissions
- 📝 **Content Management**: Blog posts, categories, and newsletter management
- 📈 **Sales Tracking**: Monitor purchases and revenue
- 🔧 **System Settings**: Configure payment and email settings

### 🎨 **Design Features**
- 🌙 **Dark/Light Mode**: Toggle between themes
- 🎭 **Modern UI**: Clean, professional design with smooth animations
- 📱 **Mobile-First**: Responsive design for all screen sizes
- ⚡ **Fast Loading**: Optimized images and lazy loading
- 🎯 **Accessibility**: WCAG compliant design

---

## 🛠️ Tech Stack

### **Frontend Technologies**
```typescript
// Core Framework
Next.js 15.3.5          // React framework with App Router
TypeScript 5.0          // Type-safe JavaScript
React 18                // UI library with hooks

// Styling & UI
Tailwind CSS 3.0        // Utility-first CSS framework
Radix UI                // Accessible component primitives
Lucide React            // Beautiful icons
Framer Motion           // Smooth animations

// State Management
Redux Toolkit           // Predictable state container
TanStack Query          // Server state management
React Hook Form         // Form handling with validation
Zod                    // Schema validation

// Authentication & Database
Firebase Auth           // User authentication
Firebase Firestore      // NoSQL database
```

### **Development Tools**
```json
{
  "eslint": "Code linting and formatting",
  "prettier": "Code formatting",
  "husky": "Git hooks",
  "lint-staged": "Pre-commit linting",
  "typescript": "Type checking"
}
```

### **Deployment & Hosting**
- **Vercel**: Frontend hosting and deployment
- **Firebase**: Backend services and authentication
- **Cloudinary**: Image optimization and storage
- **LemonSqueezy**: Payment processing

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Git

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/techfynite-frontend.git
cd techfynite-frontend

# Install dependencies
npm install
# or
yarn install

# Copy environment variables
cp env.example .env.local

# Start development server
npm run dev
# or
yarn dev
```

### **Environment Setup**

Create `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Environment
NODE_ENV=development
```

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

---

## 📱 Screenshots

### 🏠 **Homepage**
![Homepage](https://via.placeholder.com/800x400/1e40af/ffffff?text=Modern+Homepage+Design)

### 🛒 **Template Marketplace**
![Marketplace](https://via.placeholder.com/800x400/059669/ffffff?text=Template+Marketplace)

### 👨‍💼 **Admin Dashboard**
![Dashboard](https://via.placeholder.com/800x400/7c3aed/ffffff?text=Admin+Dashboard)

### 📱 **Mobile Responsive**
![Mobile](https://via.placeholder.com/400x800/dc2626/ffffff?text=Mobile+Responsive)

---

## 🏗️ Architecture

### **Project Structure**
```
techfynite-frontend/
├── 📁 app/                          # Next.js App Router
│   ├── (WithCommonLayout)/        # Public pages
│   │   ├── (home)/                 # Homepage
│   │   ├── blogs/                  # Blog pages
│   │   ├── template/               # Template details
│   │   └── checkout/               # Checkout flow
│   ├── dashboard/                  # Admin dashboard
│   └── api/                        # API routes
├── 📁 components/                  # Reusable components
│   ├── modules/                    # Feature modules
│   │   ├── CommonModules/          # Public components
│   │   └── DadhboardModules/       # Admin components
│   ├── shared/                     # Shared components
│   └── ui/                         # UI primitives
├── 📁 hooks/                       # Custom React hooks
├── 📁 lib/                         # Utilities & configs
├── 📁 types/                       # TypeScript types
└── 📁 assets/                      # Static assets
```

### **Component Architecture**
```typescript
// Feature-based organization
components/
├── modules/
│   ├── CommonModules/              # Public features
│   │   ├── template/              # Template components
│   │   ├── blogs/                 # Blog components
│   │   └── checkout/              # Checkout components
│   └── DadhboardModules/          # Admin features
│       ├── Templates/             # Template management
│       ├── Users/                 # User management
│       └── Analytics/             # Dashboard analytics
```

---

## 🔧 API Integration

### **RESTful API Endpoints**
```typescript
// Template Management
GET    /api/v1/templates           // Get all templates
GET    /api/v1/templates/:id       // Get template by ID
POST   /api/v1/templates           // Create template
PUT    /api/v1/templates/:id       // Update template
DELETE /api/v1/templates/:id       // Delete template

// User Management
GET    /api/v1/users               // Get all users
GET    /api/v1/users/:id           // Get user by ID
PUT    /api/v1/users/:id           // Update user

// Purchase Management
POST   /api/v1/purchases           // Create purchase
GET    /api/v1/purchases/:userId   // Get user purchases
```

### **Data Fetching with TanStack Query**
```typescript
// Custom hooks for API integration
const { data: templates, isLoading } = useGetTemplates();
const { data: template } = useGetTemplateById(id);
const createTemplate = useCreateTemplate();
const updateTemplate = useUpdateTemplate();
```

---

## 📦 Key Components

### **🛒 E-commerce Components**
- **TemplateCard**: Display template information with actions
- **ShoppingCart**: Cart management with quantity controls
- **CheckoutForm**: Secure checkout with validation
- **PaymentModal**: Success modal with download options

### **👨‍💼 Admin Components**
- **Dashboard**: Analytics and overview
- **TemplateManager**: CRUD operations for templates
- **UserManager**: User account management
- **ContentManager**: Blog and content management

### **🎨 UI Components**
- **ResponsiveLayout**: Mobile-first layout system
- **ThemeToggle**: Dark/light mode switcher
- **LoadingStates**: Skeleton loaders and spinners
- **ErrorBoundaries**: Graceful error handling

---

## 🎨 UI/UX Features

### **Design System**
- **Color Palette**: Consistent brand colors
- **Typography**: Inter font family with proper hierarchy
- **Spacing**: 8px grid system for consistent spacing
- **Components**: Reusable component library

### **Responsive Design**
```css
/* Mobile-first approach */
.container {
  @apply px-4 sm:px-6 lg:px-8;
  @apply max-w-7xl mx-auto;
}

/* Responsive grid */
.grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}
```

### **Accessibility**
- **WCAG 2.1 AA Compliant**: Proper contrast ratios and keyboard navigation
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Focus Management**: Clear focus indicators
- **Color Blind Friendly**: Accessible color combinations

---

## 🚀 Deployment

### **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### **Environment Variables**
```env
# Production Environment
NEXT_PUBLIC_API_URL=https://api.techfynite.com/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_key
NODE_ENV=production
```

### **Build Optimization**
- **Image Optimization**: Next.js Image component with WebP support
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Optimized bundle size
- **Caching**: Static generation with ISR

---

## 📈 Performance

### **Core Web Vitals**
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### **Optimization Techniques**
- **Lazy Loading**: Images and components loaded on demand
- **Memoization**: React.memo and useMemo for performance
- **Virtual Scrolling**: Large lists with react-window
- **Service Workers**: Offline functionality

### **Bundle Analysis**
```bash
# Analyze bundle size
npm run build
npm run analyze
```

---

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with custom rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance

---

## 📞 Contact & Support

<div align="center">

**Built with ❤️ by [Md Parvej]**

[![Portfolio](https://img.shields.io/badge/🌐_Portfolio-Visit_Site-blue?style=for-the-badge)](https://yourportfolio.com)
[![LinkedIn](https://img.shields.io/badge/💼_LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/yourprofile)
[![Email](https://img.shields.io/badge/📧_Email-Contact-red?style=for-the-badge&logo=gmail)](mailto:your.email@example.com)

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/techfynite-frontend?style=social)](https://github.com/yourusername/techfynite-frontend)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/techfynite-frontend?style=social)](https://github.com/yourusername/techfynite-frontend)

</div>