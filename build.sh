#!/bin/bash

# PlayFaster - Chrome Web Store Build Script

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Building PlayFaster for Chrome Web Store...${NC}"

# Clean previous build
echo "Cleaning previous builds..."
rm -f playfaster.zip

# Create zip excluding development files
echo "Creating zip archive..."
zip -r -q playfaster.zip . \
  -x ".*" \
  -x "__MACOSX/*" \
  -x "*.DS_Store" \
  -x "*.zip" \
  -x ".git/*" \
  -x "*.md" \
  -x "*.sh" \
  -x "docs/*"

# Get zip size
SIZE=$(du -h playfaster.zip | cut -f1)

echo -e "${GREEN}✓ Build complete!${NC}"
echo ""
echo "Package: playfaster.zip"
echo "Size: $SIZE"
echo ""
echo "Ready to upload to Chrome Web Store Developer Dashboard:"
echo "https://chrome.google.com/webstore/devconsole"
