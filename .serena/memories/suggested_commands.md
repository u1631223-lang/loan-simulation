# Suggested Development Commands

## Daily Development

### Start Development Server
```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
# LAN access enabled for mobile testing (host: true)
```

### Build & Preview
```bash
npm run build        # Production build (TypeScript + Vite)
npm run preview      # Preview production build locally
```

### Type Checking & Linting
```bash
npm run type-check   # TypeScript type checking (no emit)
npm run lint         # Run ESLint
```

### Testing
```bash
npm run test -- --run    # ⚠️ IMPORTANT: Use --run to avoid timeout
npm run test             # Watch mode (for active development)
npm run test:ui          # Vitest UI mode
```

**⚠️ Testing Important Note:**
- Always use `npm run test -- --run` for one-time test runs
- Default `npm run test` runs in watch mode and never exits
- See `docs/TROUBLESHOOTING.md` for details

## Mobile Development

### Sync Web to Native
```bash
npm run cap:sync         # Build web app + sync to native platforms
# Equivalent to: npm run build && npx cap sync
```

### Open in Native IDEs
```bash
npm run cap:open:android # Open Android Studio
npm run cap:open:ios     # Open Xcode (Mac only)
```

### Run on Emulators
```bash
npm run cap:run:android  # Run on Android emulator
npm run cap:run:ios      # Run on iOS simulator (Mac only)
```

## Mobile Testing on Real Devices

### Check Dev Server Status
```bash
npm run check-server     # Check if Vite is running on port 5173
```

### Get LAN Access URL
```bash
npm run mobile-test      # Display LAN IPs for phone testing
# Example output: http://192.168.0.77:5173
```

### Steps for Phone Testing (Same Wi-Fi)
1. Start dev server: `npm run dev`
2. Find LAN URL: `npm run mobile-test`
3. Open URL on phone browser
4. Test responsive design & touch interactions

## Git & Version Control

### Common Git Commands
```bash
git status               # Check current status
git add .                # Stage all changes
git commit -m "message"  # Commit with message
git log --oneline        # View commit history
git diff                 # View unstaged changes
git branch               # List branches
git checkout -b <name>   # Create new branch
```

## macOS System Utilities

Since the system is **Darwin (macOS)**, these are the available utilities:

```bash
# File operations
ls -la                   # List files with details
cd <directory>           # Change directory
pwd                      # Print working directory
cp <src> <dest>          # Copy files
mv <src> <dest>          # Move/rename files
rm <file>                # Remove file
rm -rf <dir>             # Remove directory recursively

# Search operations
grep -r "pattern" <dir>  # Search for pattern in files
find . -name "*.ts"      # Find files by name

# Process management
ps aux                   # List running processes
lsof -i :5173            # Check what's using port 5173
kill <PID>               # Kill process by ID
```

## Deployment

### Web Deployment (Vercel)
```bash
npm i -g vercel          # Install Vercel CLI globally
vercel --prod            # Deploy to production
```

### Alternative Hosting
- Netlify: `netlify deploy --prod`
- Cloudflare Pages: Connect via Git

## Troubleshooting

### Common Issues
- **Port already in use**: `lsof -i :5173` → `kill <PID>`
- **npm test timeout**: Use `npm run test -- --run`
- **TypeScript errors**: `npm run type-check`
- **Build failures**: Check `docs/TROUBLESHOOTING.md`

### Mobile-Specific
- **LAN access not working**: Check firewall settings
- **Capacitor sync fails**: Run `npm run build` first
- **Native build errors**: Open in native IDE and check logs
