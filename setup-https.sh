#!/bin/bash
# Quick HTTPS Setup Script for FYNC Development
echo "🔒 Setting up HTTPS for FYNC Development"
echo "======================================"
echo ""

# Check if we're on Windows
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "📍 Detected Windows environment"
    echo ""
    
    # Check if mkcert is installed
    if command -v mkcert &> /dev/null; then
        echo "✅ mkcert is already installed"
    else
        echo "❌ mkcert not found"
        echo "🔧 Installing mkcert..."
        echo ""
        echo "Choose an installation method:"
        echo "1. Chocolatey (if you have it): choco install mkcert"
        echo "2. Scoop (if you have it): scoop bucket add extras && scoop install mkcert"  
        echo "3. Manual download from: https://github.com/FiloSottile/mkcert/releases"
        echo ""
        echo "After installing mkcert, run this script again."
        exit 1
    fi
else
    echo "📍 Detected Unix-like environment"
    
    # Check if mkcert is installed
    if command -v mkcert &> /dev/null; then
        echo "✅ mkcert is already installed"
    else
        echo "❌ mkcert not found"
        echo "🔧 Please install mkcert first:"
        echo "- macOS: brew install mkcert"
        echo "- Linux: Follow instructions at https://github.com/FiloSottile/mkcert#installation"
        exit 1
    fi
fi

echo ""
echo "🔧 Setting up local HTTPS certificates..."

# Install the local CA
echo "📋 Installing local Certificate Authority..."
mkcert -install

# Generate certificates for localhost
echo "🔑 Generating certificates for localhost..."
mkcert localhost 127.0.0.1 ::1

# Check if certificates were created
if [[ -f "localhost+2.pem" && -f "localhost+2-key.pem" ]]; then
    echo "✅ Certificates created successfully!"
    echo "   - Certificate: localhost+2.pem"
    echo "   - Private Key: localhost+2-key.pem"
else
    echo "❌ Certificate creation failed"
    exit 1
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Start your development server: npm run dev"
echo "2. Open https://localhost:5173 in your browser"
echo "3. You should see a secure connection (lock icon)"
echo "4. Test the Spotify OAuth integration!"
echo ""
echo "🔍 Testing checklist:"
echo "   □ Visit https://localhost:5173"
echo "   □ No certificate warnings"
echo "   □ Lock icon appears in browser"
echo "   □ Spotify OAuth works in onboarding"
echo ""
echo "🎵 Your FYNC app is now ready for secure Spotify integration!"
