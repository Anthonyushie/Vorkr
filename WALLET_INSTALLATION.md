# 🔗 Quick Wallet Installation Guide

## ❌ The #1 Reason Connect Button Doesn't Work

**99% of the time, the connect wallet button doesn't work because NO STACKS WALLET IS INSTALLED!**

## 🚀 Quick Fix - Install a Stacks Wallet (Choose One)

### Option 1: Hiro Wallet (Recommended for Testing) 🔥

**Chrome/Edge:**
1. Go to: https://wallet.hiro.so/
2. Click "Download" 
3. Click "Add to Chrome"
4. Follow the setup wizard
5. **Refresh your webpage after installation**

**Firefox:**
1. Go to: https://addons.mozilla.org/en-US/firefox/addon/hiro-wallet/
2. Click "Add to Firefox"
3. Follow the setup wizard
4. **Refresh your webpage after installation**

### Option 2: Leather Wallet (Most Features) 🧳

**Chrome/Edge:**
1. Go to: https://leather.io/
2. Click "Download"
3. Select "Chrome Extension"
4. Click "Add to Chrome"
5. Follow the setup wizard
6. **Refresh your webpage after installation**

### Option 3: Xverse Wallet (Mobile + Desktop) ✨

**Chrome/Edge:**
1. Go to: https://www.xverse.app/download
2. Click "Chrome Extension"
3. Click "Add to Chrome"
4. Follow the setup wizard
5. **Refresh your webpage after installation**

**Mobile:**
1. Download Xverse app from App Store or Google Play
2. Open the app and complete setup
3. Use the built-in browser to visit your app

## ✅ How to Test if Installation Worked

### Method 1: Check Extensions
1. Go to `chrome://extensions/` (or equivalent in your browser)
2. Look for "Hiro Wallet", "Leather", or "Xverse"
3. Make sure it's **enabled** (toggle switch on)

### Method 2: Browser Console Test
1. Open your app in browser
2. Press F12 → Console tab
3. Type: `console.log("Hiro:", !!window.StacksProvider, "Leather:", !!window.LeatherProvider)`
4. Press Enter
5. Should see `true` for installed wallets

### Method 3: Use Our Debug Tools
1. Go to `http://localhost:8081/wallet-demo`
2. Click "Debug Tools" tab
3. Use "Test Wallet Detection" button
4. Check the debug logs

## 🔄 After Installing a Wallet

1. **Refresh your webpage** (very important!)
2. Go to the wallet extension and complete the setup
3. Create or import a wallet
4. **For testing**: Switch to testnet in the wallet settings
5. Get free testnet STX from: https://explorer.stacks.co/sandbox/faucet?chain=testnet

## 🎯 Testing Steps

### Step 1: Install Wallet
Choose one wallet from the options above and install it.

### Step 2: Test Detection
1. Go to: `http://localhost:8081/wallet-demo`
2. Click "Debug Tools" tab
3. Click "Test Wallet Detection"
4. Should see ✅ green checkmarks

### Step 3: Test Connection
1. Click "Test Direct Connection"
2. Wallet popup should appear
3. Click "Connect" in the wallet popup
4. Should see "Connection successful!"

### Step 4: Test Full Integration
1. Go back to "Wallet Integration" tab  
2. You should now see your wallet in the "Available Wallets" section
3. Click "Connect" button - it should work!

## 🚨 Troubleshooting

### Issue: Extension installed but not detected
**Fix:** 
1. Refresh the webpage
2. Make sure extension is enabled
3. Try incognito mode
4. Check if extension has permissions

### Issue: Wallet popup doesn't appear
**Fix:**
1. Check if popup blocker is enabled
2. Try clicking in a different area
3. Check browser console for errors
4. Restart browser and try again

### Issue: Connection succeeds but no balance
**Fix:**
1. Make sure wallet is on testnet
2. Get free testnet STX from faucet
3. Check if app is configured for testnet (`VITE_STACKS_NETWORK=testnet`)

## 📱 Mobile Testing

### For Mobile Web:
- Use Chrome/Firefox on mobile with Leather wallet
- Some wallets work through WalletConnect on mobile

### For Mobile Apps:
- Install Xverse mobile app
- Use the app's built-in browser
- Navigate to your deployed app URL

## 🔧 Development vs Production

### Development (localhost):
- Use testnet wallets
- Get free STX from testnet faucet
- Set `VITE_STACKS_NETWORK=testnet`

### Production (deployed):
- Can use mainnet wallets (real STX)
- Set `VITE_STACKS_NETWORK=mainnet`
- **Always test on testnet first!**

## ✅ Success Checklist

You'll know everything is working when:

- [ ] Wallet extension is installed and enabled
- [ ] Debug tools show green checkmarks for wallet detection
- [ ] "Test Direct Connection" button works
- [ ] Wallet popup appears when clicked
- [ ] Connection completes successfully
- [ ] Main wallet integration shows your wallet as available
- [ ] Connect button in main interface works
- [ ] Balance displays (if you have testnet STX)

## 🆘 Still Not Working?

If you've installed a wallet and it's still not working:

1. **Try a different browser** (Chrome works best)
2. **Try incognito/private mode** 
3. **Clear browser cache and cookies**
4. **Disable other extensions** temporarily
5. **Check the browser console** for error messages
6. **Try a different wallet** (Hiro is usually most reliable)

## 📞 Need More Help?

Check the debug logs in the "Debug Tools" tab - they'll show exactly what's happening and where the issue is!

The most common issue is simply: **No wallet installed** 🙂