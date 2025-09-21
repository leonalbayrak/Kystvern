# Documentation

This directory contains the built application for GitHub Pages deployment.

## Deployment

The application is automatically built and deployed to GitHub Pages from this directory.

### Build Process

1. Run `npm run build` to create the production build
2. Copy all files from `dist/` to `docs/`
3. Commit and push changes
4. GitHub Pages will serve the application from this directory

### File Structure

After building, this directory should contain:

```
docs/
├── index.html          # Main HTML file
├── assets/             # Built CSS and JS files
│   ├── index-[hash].css
│   └── index-[hash].js
├── vite.svg           # Favicon
└── manifest.webmanifest # PWA manifest
```

### GitHub Pages Configuration

The repository should be configured with:

- **Source**: Deploy from a branch
- **Branch**: `main` (or your default branch)
- **Folder**: `/docs`

### Local Testing

To test the built application locally:

1. Build the project: `npm run build`
2. Copy `dist/*` to `docs/`
3. Serve the docs directory with a local server:
   ```bash
   # Using Python
   python -m http.server 8000 -d docs
   
   # Using Node.js
   npx serve docs
   ```
4. Open `http://localhost:8000`

### Troubleshooting

**Common Issues:**

1. **404 Errors**: Ensure all files are copied to `docs/` directory
2. **Missing Assets**: Check that the build process completed successfully
3. **CORS Issues**: Some APIs may not work in local file:// protocol

**Build Verification:**

- Check that `index.html` exists and contains proper asset references
- Verify that CSS and JS files are present in `assets/` directory
- Ensure `manifest.webmanifest` is accessible

### Performance

The built application is optimized for production:

- Minified CSS and JavaScript
- Tree-shaken dependencies
- Optimized assets
- Proper caching headers (when served by GitHub Pages)

### Security

- No sensitive data is included in the build
- API keys are not stored in the client-side code
- All external API calls use HTTPS
