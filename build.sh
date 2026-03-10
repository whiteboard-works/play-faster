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
rm -f enhanced-video-audio-speed.zip

# Create zip excluding development files
echo "Creating zip archive..."
zip -r -q enhanced-video-audio-speed.zip . \
  -x ".*" \
  -x "__MACOSX/*" \
  -x "*.DS_Store" \
  -x "*.zip" \
  -x ".git/*" \
  -x "*.md" \
  -x "*.sh"

# Get zip size
SIZE=$(du -h enhanced-video-audio-speed.zip | cut -f1)

echo -e "${GREEN}✓ Build complete!${NC}"
echo ""
echo "Package: enhanced-video-audio-speed.zip"
echo "Size: $SIZE"
echo ""
echo "Ready to upload to Chrome Web Store Developer Dashboard:"
echo "https://chrome.google.com/webstore/devconsole"
