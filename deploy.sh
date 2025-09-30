#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║        🚀 AI PERSONA FRONTEND - VERCEL DEPLOYMENT                ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in frontend directory"
    exit 1
fi

echo "📦 Building project first..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors first."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "Choose deployment method:"
echo "1) Deploy with Vercel CLI (recommended)"
echo "2) Commit and push to Git (auto-deploy)"
echo "3) Show manual instructions"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to Vercel..."
        
        # Check if vercel is installed
        if ! command -v vercel &> /dev/null; then
            echo "📥 Installing Vercel CLI..."
            npm i -g vercel
        fi
        
        vercel --prod
        
        echo ""
        echo "✅ Deployment complete!"
        echo "🌐 Check your deployment at: https://ai-persona-frontend-ashy.vercel.app"
        ;;
    
    2)
        echo ""
        echo "📝 Committing changes..."
        git add src/pages/EmailVerificationPage.tsx .gitignore
        git commit -m "fix: Email verification now calls backend API correctly"
        
        echo "🚀 Pushing to remote..."
        git push origin main || git push origin master
        
        echo ""
        echo "✅ Pushed! Vercel will auto-deploy in ~1-2 minutes"
        echo "📊 Monitor at: https://vercel.com/dashboard"
        ;;
    
    3)
        echo ""
        echo "📖 MANUAL DEPLOYMENT:"
        echo "─────────────────────────────────────────────────────────"
        echo "1. Go to: https://vercel.com/dashboard"
        echo "2. Select your project"
        echo "3. Click 'Deployments' → 'Redeploy'"
        echo ""
        echo "OR via CLI:"
        echo "  npm i -g vercel"
        echo "  vercel --prod"
        echo ""
        echo "OR via Git:"
        echo "  git add ."
        echo "  git commit -m 'Update email verification'"
        echo "  git push origin main"
        ;;
    
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "⚠️  IMPORTANT: Verify environment variable on Vercel:"
echo "    VITE_BACKEND_URL=https://ai-persona-backend-828912814307.asia-southeast1.run.app"
echo ""
echo "    Go to: https://vercel.com/your-project/settings/environment-variables"
