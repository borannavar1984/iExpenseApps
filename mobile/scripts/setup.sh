#!/bin/bash
# iFinWell Mobile App Setup Script
# Automates: clone, install, and run setup

set -e

echo "🚀 iFinWell Mobile App Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if we're in the mobile directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the mobile/ directory"
    echo "   cd iExpenseApps/mobile && bash scripts/setup.sh"
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies (this may take 5-10 minutes)..."
npm install

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo ""
    echo "📱 Installing Expo CLI globally..."
    npm install -g expo-cli
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Make sure Expo Go is installed on your iPhone (App Store)"
echo "  2. Run: npm start"
echo "  3. Scan the QR code with Expo Go"
echo ""
