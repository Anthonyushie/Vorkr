# 🧪 Stacks.js Multi-Wallet Integration Testing Guide

## 🚨 Quick Troubleshooting Checklist

If your connect wallet button isn't working, follow these steps:

### ✅ **Step 1: Environment Setup**
```bash
# 1. Make sure you have a .env file (created for you)
# 2. Set the correct network
VITE_STACKS_NETWORK=testnet  # for testing
# or
VITE_STACKS_NETWORK=mainnet  # for production
```

### ✅ **Step 2: Install a Stacks Wallet**
You MUST have at least one Stacks wallet installed:

#### **Recommended Wallets:**
1. **Hiro Wallet** (Easiest to start with)
   - Chrome: https://wallet.hiro.so/
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/hiro-wallet/

2. **Leather Wallet** (Most features)
   - Chrome: https://leather.io/
   - Download and install the browser extension

3. **Xverse Wallet** (Mobile + Desktop)
   - Chrome: https://www.xverse.app/download
   - Available on mobile too

### ✅ **Step 3: Build and Run Locally**
```bash
# Clean install (if having issues)
rm -rf node_modules package-lock.json
npm install

# Build the project
npm run build

# Run development server
npm run dev
```

### ✅ **Step 4: Test the Integration**
1. Open your browser to `http://localhost:5173/wallet-demo`
2. Check the browser console (F12) for any errors
3. Look for the wallet detection status
4. Try connecting with each installed wallet

---

## 🔍 **Detailed Debugging Steps**

### **1. Browser Console Debugging**
Open Developer Tools (F12) and check for:

#### **Common Error Messages:**
```javascript
// ❌ Wallet not installed
"hiro wallet is not installed"
"leather wallet is not installed"

// ❌ Network issues
"Failed to fetch balance"
"Network connection error"

// ❌ Environment issues
"VITE_STACKS_NETWORK is undefined"

// ✅ Success messages
"Wallet connected successfully: hiro"
"Available wallets detected: 2"
```

### **2. Wallet Detection Test**
```javascript
// Open browser console and run:
console.log("Hiro:", !!window.StacksProvider);
console.log("Leather:", !!window.LeatherProvider);
console.log("Xverse:", !!window.XverseProviders);

// Should show 'true' for installed wallets
```

### **3. Network Configuration Test**
Check if your environment variables are loaded:
```javascript
// In browser console:
console.log("Network:", import.meta.env.VITE_STACKS_NETWORK);
// Should show 'testnet' or 'mainnet'
```

---

## 🧪 **Testing Scenarios**

### **Scenario 1: No Wallets Installed**
**Expected:** 
- "No Stacks wallets detected" message
- Install wallet prompts with links
- No connect buttons active

**Fix:** Install at least one Stacks wallet

### **Scenario 2: Wallet Installed but Not Connecting**
**Expected:** 
- Wallet shows in available list
- Connect button is clickable
- Clicking opens wallet popup

**Debug:**
1. Try refreshing the page
2. Check if wallet extension is enabled
3. Try connecting in incognito mode
4. Check wallet extension permissions

### **Scenario 3: Network Issues**
**Expected:**
- Connection works but balance doesn't load
- "Failed to fetch balance" errors

**Debug:**
1. Check network connection
2. Try switching networks (testnet/mainnet)
3. Check if Stacks API is accessible

### **Scenario 4: Environment Variable Issues**
**Expected:**
- App loads but wallet functions don't work
- Console shows undefined environment variables

**Debug:**
1. Check `.env` file exists
2. Restart development server
3. Verify variable names start with `VITE_`

---

## 📱 **Mobile Testing**

### **Mobile Wallet Support:**
- **Xverse**: Full mobile app support
- **Leather**: Mobile web browser support
- **Hiro**: Mobile web browser support

### **Mobile Testing Steps:**
1. Install Xverse mobile app or use mobile browser
2. Navigate to your deployed app
3. Test wallet connection on mobile
4. Check responsive design

---

## 🚀 **Production Deployment Testing**

### **Pre-deployment Checklist:**
```bash
# 1. Set production environment
VITE_STACKS_NETWORK=mainnet

# 2. Update Supabase URLs (if using)
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-key

# 3. Build for production
npm run build

# 4. Test build locally
npm run preview
```

### **Production Testing:**
1. **Mainnet Testing:** Use real STX (small amounts!)
2. **Testnet Testing:** Use free testnet STX first
3. **Cross-browser Testing:** Chrome, Firefox, Safari, Edge
4. **Mobile Testing:** iOS Safari, Android Chrome

---

## 🛠️ **Common Issues & Solutions**

### **Issue: "Connect Wallet" Button Does Nothing**
**Causes:**
- No wallet installed
- JavaScript errors
- Network configuration missing
- Build issues

**Solutions:**
1. Install a Stacks wallet
2. Check browser console for errors
3. Verify `.env` file exists with `VITE_STACKS_NETWORK`
4. Rebuild the project: `npm run build`

### **Issue: Wallet Connects But No Balance**
**Causes:**
- Network mismatch (mainnet vs testnet)
- API connection issues
- Wrong address format

**Solutions:**
1. Check network settings match wallet network
2. Try switching networks in the UI
3. Verify address format in console
4. Test with testnet first (get free STX from faucet)

### **Issue: "Wallet Not Detected"**
**Causes:**
- Wallet extension disabled
- Page loaded before wallet injection
- Extension permissions

**Solutions:**
1. Refresh the page
2. Enable wallet extension
3. Check extension permissions
4. Try incognito mode

### **Issue: Testnet Faucet Not Working**
**Alternative Faucets:**
- https://explorer.stacks.co/sandbox/faucet?chain=testnet
- https://faucet.stx.eco/
- Join Stacks Discord for faucet access

---

## 📋 **Testing Checklist for Reviewers**

### **Basic Functionality:**
- [ ] Page loads without JavaScript errors
- [ ] Wallet detection works for installed wallets
- [ ] Connect wallet popup opens
- [ ] Wallet connection completes successfully
- [ ] Disconnect wallet works
- [ ] Network switching functions

### **Advanced Features:**
- [ ] STX balance displays correctly
- [ ] Balance refresh works
- [ ] Message signing completes
- [ ] Address copying works
- [ ] Explorer links open correctly
- [ ] Error states display properly

### **Cross-Browser Testing:**
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Edge (desktop)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### **Network Testing:**
- [ ] Testnet connection and balance
- [ ] Mainnet connection (if applicable)
- [ ] Network switching
- [ ] Address format correctness

---

## 🆘 **Getting Help**

If you're still having issues:

1. **Check Console Errors**: Open F12, look in Console tab
2. **Test Locally First**: Use `npm run dev` and test on localhost
3. **Try Different Wallets**: Test with Hiro, Leather, or Xverse
4. **Use Testnet First**: Always test with testnet before mainnet
5. **Check Documentation**: Review `STACKS_INTEGRATION.md`

### **Debugging Commands:**
```bash
# Check environment
cat .env

# Verify build
npm run build

# Type checking
npx tsc --noEmit

# Start development server
npm run dev
```

### **Browser Debug Commands:**
```javascript
// Check wallet injection
console.log("Wallets:", {
  hiro: !!window.StacksProvider,
  leather: !!window.LeatherProvider,
  xverse: !!window.XverseProviders
});

// Check environment
console.log("Env:", import.meta.env);

// Test wallet detection
import { detectAvailableWallets } from './src/lib/stacks';
console.log("Detected:", detectAvailableWallets());
```

---

## ✅ **Success Indicators**

You'll know it's working when:
- Wallet detection shows green checkmarks
- Connect buttons are clickable and functional
- Wallet popup opens when clicked
- Connection completes with success message
- Balance loads and displays correctly
- Network switching works smoothly
- Message signing functions properly

**Next Steps:** Once basic connection works, test advanced features like message signing, network switching, and balance refresh!