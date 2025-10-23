# Google OAuth Test Guide

## 🧪 **Test Your OAuth Configuration**

### 1. **Use Google OAuth2 Playground**
1. Go to: https://developers.google.com/oauthplayground/
2. Click the gear icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID: `258948824471-imml3av529tla94pm964es0gjki4cdhc.apps.googleusercontent.com`
5. Enter your Client Secret (if you have it)

### 2. **Test the Authorization**
1. In the left panel, find "OAuth2 API v2"
2. Select "https://www.googleapis.com/auth/userinfo.email"
3. Click "Authorize APIs"
4. This will test if your OAuth configuration works

### 3. **Manual URL Test**
Try this URL directly in your browser:
```
https://accounts.google.com/oauth/authorize?client_id=258948824471-imml3av529tla94pm964es0gjki4cdhc.apps.googleusercontent.com&response_type=code&scope=openid%20email%20profile&redirect_uri=https://pinglyy.vercel.app/auth/google/callback&access_type=offline&prompt=select_account
```

## 🔧 **Common Issues & Solutions**

### Issue 1: Redirect URI Mismatch
**Solution:** Make sure in your Google OAuth console you have:
- `https://pinglyy.vercel.app/auth/google/callback` (exact match)

### Issue 2: Client ID Issues
**Solution:** Verify your Client ID is correct and active

### Issue 3: Domain Verification
**Solution:** Make sure your domain is verified in Google Cloud Console

## 📋 **Checklist**
- [ ] Redirect URI matches exactly
- [ ] Client ID is correct
- [ ] OAuth consent screen is configured
- [ ] Domain is verified
- [ ] No typos in the URL
