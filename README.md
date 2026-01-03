# DarkSwap Desktop

A desktop application for DarkSwap - a decentralized exchange platform.

## Overview

DarkSwap Desktop provides a native desktop experience for trading and managing cryptocurrency assets on the DarkSwap protocol.

## Features

- Decentralized token swapping
- Wallet integration
- Portfolio management
- Cross-platform support (MacOS, Window)

## Configuration

Check the config folder

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/darkSwap-desktop.git

# Navigate to project directory
cd darkSwap-desktop

# Install client-core
cd darkSwap-client-core
npm install
npm run build

# Install dependencies
npm install

# Start the application
npm run dev:testnet
```

## Development

```bash
# Run in development mode with testnet
npm run dev:testnet
# Run in development mode with prod
npm run dev:prod

# Build for production with testnet
npm run build:testnet
# Build for production with prod
npm run build:prod

```

## Tech Stack

- Electron (or your framework)
- Next.js
- Ethers.js
- Node.js
- Typescript

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## Support

For issues and questions, please open an issue on GitHub.
