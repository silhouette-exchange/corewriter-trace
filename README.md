# CoreWriter Trace 🔍

A modern Next.js application for decoding Hyperliquid CoreWriter actions from transaction logs. Built with React 19, Next.js 15, and TypeScript for optimal performance and developer experience.

![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.1-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=flat-square&logo=typescript)
![pnpm](https://img.shields.io/badge/pnpm-9.15.0+-orange?style=flat-square&logo=pnpm)

## ✨ Features

- 🔍 **Transaction Analysis**: Decode CoreWriter actions from Hyperliquid transaction logs
- 🌐 **Multi-Network Support**: Mainnet, Testnet, and custom RPC endpoints
- ⚡ **Modern Stack**: Next.js 15 with App Router, React 19, TypeScript
- 🔒 **Zero Vulnerabilities**: Secure, up-to-date dependencies
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🚀 **Optimized Performance**: Static export with automatic code splitting
- 🛠️ **Developer Experience**: Hot reload, TypeScript, ESLint

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.18.0 or higher (or active LTS 20+ recommended)
- **pnpm**: 8.0.0 or higher (recommended package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/silhouette-exchange/corewriter-trace.git
cd corewriter-trace

# Install dependencies with pnpm (recommended)
pnpm install

# Or with npm
npm install

# Or with yarn
yarn install
```

### Development

```bash
# Start development server
pnpm dev

# The app will be available at http://localhost:3000
```

### Building for Production

```bash
# Build the application (produces static files in out/ directory)
pnpm build

# Serve the static export with a static file server
pnpm start

# Or use npx serve directly
npx serve out/
```

**Note**: This project uses Next.js with `output: 'export'` which produces static files. Next.js production server (`next start`) is disabled for export mode, so a static file server must be used instead.

## 📖 Usage

1. **Select Network**: Choose between Mainnet, Testnet, or enter a custom RPC endpoint
2. **Enter Transaction Hash**: Paste the transaction hash you want to analyze
3. **Load Transaction**: Click "Load" to fetch and decode CoreWriter actions
4. **View Results**: Examine the decoded actions with detailed parameter information

### Example Transaction

Try this sample transaction hash on Mainnet:
```text
0xfda27b7180779cfd99ebcd5a451bb68dead6d89fab8e508a7b5b6d137dccd51e
```

## 🏗️ Architecture

### Project Structure

```text
corewriter-trace/
├── app/                          # Next.js App Router
│   ├── components/              # React components
│   │   └── CoreWriterActionLog/ # Action log decoder component
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page component
├── public/                     # Static assets
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies and scripts
├── pnpm-lock.yaml            # pnpm lockfile
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

### Key Components

- **`app/page.tsx`**: Main application component with transaction loading logic
- **`app/components/CoreWriterActionLog/`**: Decoder component for CoreWriter actions
- **`app/layout.tsx`**: Root layout with metadata and global styles

### Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.9](https://www.typescriptlang.org/)
- **Blockchain**: [Ethers.js 6.15](https://docs.ethers.org/v6/)
- **Package Manager**: [pnpm 9.15+](https://pnpm.io/)
- **Styling**: CSS with modern features
- **Linting**: ESLint with Next.js configuration

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Quality Assurance
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript type checking
pnpm test         # Run tests (when configured)

# Maintenance
pnpm clean        # Clean build artifacts and cache
```

### Environment Configuration

The application supports multiple network configurations:

- **Mainnet RPC**: `https://rpc.purroofgroup.com`
- **Testnet RPC**: `https://rpc.hyperliquid-testnet.xyz/evm`
- **Custom RPC**: User-configurable endpoint

### Adding New Features

1. **Components**: Add new components in `app/components/`
2. **Styles**: Add component styles to `app/globals.css`
3. **Types**: Define TypeScript types inline or in separate files
4. **Utils**: Add utility functions as needed

## 🔧 Configuration

### Next.js Configuration

The app is configured for static export in `next.config.js`:

```javascript
const nextConfig = {
  output: 'export',        // Static export
  trailingSlash: true,     // Add trailing slashes
  images: {
    unoptimized: true      // Disable image optimization for static export
  }
}
```

### TypeScript Configuration

Optimized for Next.js with modern features:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "paths": {"@/*": ["./*"]}
  }
}
```

## 🚀 Deployment

### Static Export

The application is configured for static export, making it deployable to any static hosting service:

```bash
# Build and export
pnpm build

# The static files will be in the 'out' directory
# Deploy the 'out' directory to your hosting service
```

### Deployment Options

- **Vercel**: Automatic deployment with Git integration
- **Netlify**: Drag-and-drop or Git-based deployment
- **GitHub Pages**: Static hosting with GitHub Actions
- **AWS S3**: Static website hosting
- **Any CDN**: Upload the `out` directory

### Environment Variables

No environment variables are required for basic functionality. For custom configurations, you can add:

```bash
# .env.local (optional)
NEXT_PUBLIC_DEFAULT_RPC_URL=your-custom-rpc-url
```

## 🔒 Security

- ✅ **Zero vulnerabilities**: All dependencies are up-to-date and secure
- ✅ **No deprecated packages**: Modern, maintained dependencies only
- ✅ **TypeScript**: Type safety throughout the application
- ✅ **ESLint**: Code quality and security linting
- ✅ **Static export**: No server-side vulnerabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Add appropriate error handling
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is private and proprietary to Silhouette Exchange.

## 🆘 Support

For questions, issues, or feature requests:

1. Check existing [GitHub Issues](https://github.com/silhouette-exchange/corewriter-trace/issues)
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Migration Notes

This application was migrated from Create React App to Next.js 15 for:

- **Better Performance**: Automatic code splitting and optimization
- **Modern Features**: Latest React and Next.js capabilities
- **Security**: Zero vulnerabilities vs. 9 in the previous version
- **Developer Experience**: Better tooling and faster builds
- **Future-Proof**: Built on modern, actively maintained technologies

All functionality from the original CRA version has been preserved while gaining significant improvements in performance, security, and maintainability.

---

Built with ❤️ by the Silhouette Exchange team
