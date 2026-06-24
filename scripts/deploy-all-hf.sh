#!/bin/bash

# Deploy complete MeetMind (all services) to single Hugging Face Space
# Usage: ./scripts/deploy-all-hf.sh <your-hf-username> <space-name>

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./scripts/deploy-all-hf.sh <your-hf-username> <space-name>"
    echo "Example: ./scripts/deploy-all-hf.sh john-doe meetmind"
    exit 1
fi

HF_USERNAME=$1
SPACE_NAME=$2
SPACE_URL="https://huggingface.co/spaces/$HF_USERNAME/$SPACE_NAME"

echo "🚀 Deploying Complete MeetMind to Hugging Face Space"
echo "===================================================="
echo "Space: $SPACE_URL"
echo ""

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Using temp directory: $TEMP_DIR"
echo ""

# Clone the space (or create new)
echo "📥 Cloning Space repository..."
if git clone $SPACE_URL $TEMP_DIR 2>/dev/null; then
    echo "✓ Cloned existing space"
else
    echo ""
    echo "⚠️  Space doesn't exist yet."
    echo ""
    echo "Please create it first at: https://huggingface.co/new-space"
    echo ""
    echo "Configuration:"
    echo "  - Space name: $SPACE_NAME"
    echo "  - SDK: Docker"
    echo "  - Hardware: CPU basic (free) or upgrade for better performance"
    echo ""
    read -p "Press Enter after creating the space..."
    
    echo ""
    echo "📥 Cloning newly created Space..."
    git clone $SPACE_URL $TEMP_DIR
fi

echo ""
echo "📦 Copying files..."

# Copy all necessary directories
cp -r frontend $TEMP_DIR/
cp -r backend $TEMP_DIR/
cp -r vector-service $TEMP_DIR/
cp -r deploy $TEMP_DIR/

# Copy main Dockerfile
cp Dockerfile.all-in-one $TEMP_DIR/Dockerfile

# Copy README for HF Space
cp README-HF-ALL.md $TEMP_DIR/README.md

# Copy sample transcript
cp sample-transcript.txt $TEMP_DIR/ 2>/dev/null || true

# Create .dockerignore
cat > $TEMP_DIR/.dockerignore << 'EOF'
node_modules
.git
.env
.env.*
!.env.example
*.md
!README.md
.gitignore
dist
build
__pycache__
*.pyc
*.pyo
.Python
.vscode
.idea
EOF

echo "✓ Files copied"
echo ""

# Commit and push
cd $TEMP_DIR

echo "📝 Committing changes..."
git add .
if git commit -m "Deploy complete MeetMind $(date +%Y-%m-%d-%H-%M-%S)"; then
    echo "✓ Changes committed"
else
    echo "ℹ️  No changes to commit"
fi

echo ""
echo "📤 Pushing to Hugging Face..."
git push

echo ""
echo "======================================================"
echo "✅ Deployment initiated!"
echo ""
echo "🌐 Space URL: $SPACE_URL"
echo "📱 App URL: https://$HF_USERNAME-$SPACE_NAME.hf.space"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo ""
echo "1. Set your Groq API key:"
echo "   → Go to: $SPACE_URL/settings"
echo "   → Click 'New secret'"
echo "   → Name: GROQ_API_KEY"
echo "   → Value: your_groq_api_key_here"
echo "   → Get key from: https://console.groq.com"
echo ""
echo "2. Wait for build to complete (10-15 minutes first time)"
echo "   → Check logs: $SPACE_URL/logs"
echo ""
echo "3. Once running, visit your app:"
echo "   → https://$HF_USERNAME-$SPACE_NAME.hf.space"
echo ""
echo "💡 Performance Tips:"
echo "   - Free CPU: Good for demos"
echo "   - T4 GPU: 10x faster audio transcription"
echo "   - Upgrade in Space Settings if needed"
echo ""
echo "======================================================"

# Cleanup
cd - > /dev/null
rm -rf $TEMP_DIR

echo ""
echo "🎉 Deployment script complete!"
echo "Check Space logs to monitor build progress."
