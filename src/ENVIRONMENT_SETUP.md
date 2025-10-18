# Environment Setup Guide

## Setting Up Builder.io API Key

The Builder.io integration requires an API key to function. Follow these steps to configure it:

### Step 1: Create Environment File

1. In your project root directory, create a file named `.env`
2. This file should be in the same location as your `App.tsx` file

### Step 2: Add Your API Key

Add the following line to your `.env` file:

```bash
VITE_BUILDER_IO_API_KEY=your-actual-api-key-here
```

**Important:** Replace `your-actual-api-key-here` with your actual Builder.io Public API Key

### Step 3: Get Your Builder.io API Key

1. Go to [builder.io](https://www.builder.io) and sign up or log in
2. Create a new Space (or select an existing one)
3. Click on your profile icon → **Account Settings**
4. Go to **Space Settings**
5. Find your **Public API Key** (NOT the Private Write Key)
6. Copy this key

### Step 4: Complete Setup

1. Paste the copied key into your `.env` file:
   ```bash
   VITE_BUILDER_IO_API_KEY=abc123def456...
   ```

2. **Important:** Restart your development server after creating or modifying the `.env` file

3. Refresh your browser

### Step 5: Verify Setup

1. Log in to PropertyFlow
2. Click on **"Builder.io Integration"** in the sidebar (✨ Sparkles icon)
3. You should see a green "✅ Configured and Ready" message
4. If you see an error, double-check your API key and restart the dev server

## Example .env File

Your `.env` file should look like this:

```bash
# Builder.io Configuration
VITE_BUILDER_IO_API_KEY=bpk-a1b2c3d4e5f6g7h8i9j0

# Other environment variables (if you have any)
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-supabase-key
```

## Security Notes

- ✅ **DO NOT** commit your `.env` file to git
- ✅ The `.env` file is already in `.gitignore`
- ✅ Use the **Public API Key** (safe for client-side use)
- ✅ Never use the Private Write Key in your `.env` file
- ✅ Keep your `.env` file secure and don't share it

## Troubleshooting

### Error: "Cannot read properties of undefined (reading 'VITE_BUILDER_IO_API_KEY')"

**Solution:** This error is now fixed! The code safely handles missing environment variables.

### Builder.io Setup Required Message

**Solution:** 
1. Make sure you created the `.env` file in the project root
2. Verify the API key is correct (no extra spaces)
3. Restart your development server
4. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### API Key Not Working

**Solutions:**
- Make sure you're using the **Public API Key**, not the Private Write Key
- Verify you copied the entire key (no missing characters)
- Check for extra spaces before or after the key
- Make sure the line starts with `VITE_BUILDER_IO_API_KEY=`
- Restart the development server

### Changes Not Reflecting

**Solution:**
- Always restart the development server after modifying `.env`
- Clear browser cache or hard refresh
- Check browser console for any error messages

## Using Without Builder.io (Optional)

If you don't want to use Builder.io yet, you can:

1. Simply don't create a `.env` file
2. The app will work normally
3. The Builder.io Integration page will show setup instructions
4. You can set it up later when ready

The PropertyFlow app will work perfectly without Builder.io configured - you just won't be able to use the visual page builder features until you set it up.

## Next Steps

After setting up your API key:

1. Read the [Quick Start Guide](/BUILDER_IO_QUICKSTART.md)
2. Check out the [Full Setup Guide](/BUILDER_IO_SETUP.md)
3. Start creating content in Builder.io!

---

**Need More Help?**

- Check [Builder.io Documentation](https://www.builder.io/c/docs/intro)
- Review the integration summary in PropertyFlow sidebar
- Contact Builder.io support if you have issues with your account
