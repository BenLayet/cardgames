# AWS Amplify Setup Guide

## Overview
This project is now configured to deploy to AWS Amplify. Your React Vite application will be automatically deployed whenever you push to your Git repository.

## Prerequisites
1. **AWS Account** - Sign up at https://aws.amazon.com/
2. **Git Repository** - Your code must be on GitHub, GitLab, Bitbucket, or CodeCommit
3. **AWS Amplify CLI** - Already installed globally (run: `amplify --version` to verify)

## Step 1: Push Your Code to Git
Make sure your cardgames project is in a Git repository and pushed to one of these platforms:
- GitHub
- GitLab
- Bitbucket
- AWS CodeCommit

Example for GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/cardgames.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy via AWS Amplify Console

### Option A: Using AWS Amplify Console (Easiest)
1. Go to https://console.aws.amazon.com/amplify
2. Click **Create App** → **Deploy an app**
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Authorize AWS to access your repository
5. Select your `cardgames` repository
6. Select the branch to deploy (e.g., `main`)
7. Configure build settings:
   - **Build command**: `pnpm run build`
   - **Output directory**: `dist`
8. Click **Deploy** and wait for the build to complete

### Option B: Using Amplify CLI
```bash
amplify configure
amplify init
amplify push
amplify publish
```

## pnpm Configuration

Your Amplify build is configured to use **pnpm** for faster, more efficient dependency management:

- **preBuild**: Installs pnpm globally, then runs `pnpm install --frozen-lockfile`
- **build**: Runs `pnpm run build`
- **caching**: Caches both `node_modules/` and `.pnpm-store/` for faster subsequent builds

The `--frozen-lockfile` flag ensures that dependencies match exactly what's in `pnpm-lock.yaml`, providing reproducible builds.

## Configuration Files Included

### `amplify.yml`
- Specifies the build process for AWS Amplify
- Runs `npm ci` to install dependencies
- Runs `npm run build` to build your Vite app
- Uses `dist/` as the output directory
- Caches `node_modules` for faster builds

### `.amplifyignore`
- Tells Amplify which files to ignore during deployment
- Excludes environment variables, git files, IDE settings, etc.

## Post-Deployment

### Environment Variables
If your app needs environment variables (like API keys), configure them in:
1. AWS Amplify Console → App settings → Environment variables
2. Add your variables (e.g., `VITE_API_URL`)
3. Redeploy your app

### Custom Domain
1. Go to Amplify Console → App settings → Domain management
2. Add your custom domain (requires DNS configuration)
3. AWS provides free SSL/TLS certificate automatically

### Branch Previews
Amplify automatically creates preview environments for pull requests:
- Every PR gets its own unique preview URL
- Perfect for testing before merging to main

### Monitoring
- View build logs: Amplify Console → Deployments
- Monitor performance: Amplify Console → Monitoring
- Check error logs if deployment fails

## Next Steps

1. **Push to Git** - Ensure your code is on GitHub/GitLab/Bitbucket
2. **Connect to Amplify** - Use the Amplify Console to connect your repository
3. **Set Environment Variables** - If needed (add to Amplify Console)
4. **Deploy** - Amplify will auto-deploy on every push to your main branch
5. **Get Your URL** - Your app will be live at `https://[app-id].[region].amplifyapp.com`

## Cost Estimate (AWS Free Tier)

For your cardgames project, you'll stay well within the AWS Free Tier:
- **Hosting**: 15 GB bandwidth/month free
- **Build minutes**: 1000 build minutes/month free
- **Storage**: Not needed for static hosting

Total estimated cost for typical usage: **$0-5/month**

## Troubleshooting

### Build Fails with "pnpm install"
Make sure your `pnpm-lock.yaml` is committed to Git. This file is required for reproducible builds with pnpm.

### App Shows Blank Page
1. Check that `dist/` directory is being generated correctly
2. Verify build logs in Amplify Console
3. Clear browser cache and reload

### Custom Domain Not Working
Allow 24-48 hours for DNS propagation after adding a custom domain.

## Resources
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amplify Hosting Pricing](https://aws.amazon.com/amplify/pricing/)
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)




