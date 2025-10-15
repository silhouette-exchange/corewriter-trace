# GEMINI.md

## Project Overview

This is a Next.js application called "CoreWriter Trace" that allows users to decode and analyze Hyperliquid CoreWriter actions from transaction logs. The application is built with React 19, Next.js 15, and TypeScript, and it is designed for optimal performance and developer experience. It supports multiple networks (Mainnet, Testnet, and custom RPC endpoints) and provides a responsive user interface for both desktop and mobile devices.

The application is configured for static export, which means it can be deployed to any static hosting service. It uses `ethers` to interact with the blockchain and `@nktkas/hyperliquid` for HyperCore transactions.

## Building and Running

### Prerequisites

- **Node.js**: 18.18.0 or higher
- **pnpm**: 9.15.0 or higher

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
pnpm build
```

This will create a static export of the application in the `out/` directory.

### Running in Production

```bash
pnpm start
```

This will serve the static files from the `out/` directory.

## Development Conventions

### Scripts

The following scripts are available in `package.json`:

- `pnpm dev`: Start the development server.
- `pnpm build`: Build the application for production.
- `pnpm start`: Start the production server.
- `pnpm lint`: Run ESLint to check for code quality and style issues.
- `pnpm test`: Run tests using Jest.
- `pnpm clean`: Clean build artifacts and cache.
- `pnpm type-check`: Run the TypeScript compiler to check for type errors.

### Code Style

The project uses ESLint with the `eslint-config-next` configuration to enforce a consistent code style.

### Testing

The project uses Jest for testing. The test files are located in the `__tests__` directory.

### Contribution Guidelines

The `README.md` file provides contribution guidelines, which include forking the repository, creating a feature branch, and submitting a pull request.
