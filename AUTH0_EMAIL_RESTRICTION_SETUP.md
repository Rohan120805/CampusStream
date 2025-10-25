# Auth0 Email Domain Restriction Setup

## Restrict Access to @klh.edu.in Emails Only

This guide will help you configure Auth0 to only allow users with `@klh.edu.in` email addresses to access your application.

---

## Method 1: Auth0 Actions (Recommended - Blocks at Auth0 Level)

### Step 1: Create a New Action

1. Go to your **Auth0 Dashboard**
2. Navigate to **Actions** → **Flows** → **Login**
3. Click the **"+"** button (or **"Add Action"**) on the right side
4. Select **"Build Custom"**

### Step 2: Configure the Action

**Action Name:** `Restrict to KLH Domain`

**Trigger:** `Login / Post Login`

**Code:**
```javascript
/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  const allowedDomain = 'klh.edu.in';
  const userEmail = event.user.email;
  
  // Check if email exists
  if (!userEmail) {
    api.access.deny('email_required', 'Email address is required for authentication');
    return;
  }
  
  // Check if email domain matches
  const emailDomain = userEmail.split('@')[1];
  
  if (emailDomain !== allowedDomain) {
    api.access.deny(
      'unauthorized_domain',
      `Access restricted to @${allowedDomain} email addresses only. You tried to login with: ${userEmail}. Please use your institutional email to access CampusStream.`
    );
    return;
  }
  
  console.log(`✅ Allowed login for: ${userEmail}`);
};
```

### Step 3: Deploy the Action

1. Click **"Deploy"** (top right corner)
2. The action is now created but not active yet

### Step 4: Add Action to Login Flow

1. Go back to **Actions** → **Flows** → **Login**
2. You'll see your custom action **"Restrict to KLH Domain"** in the right sidebar under **"Custom"**
3. **Drag and drop** the action between **"Start"** and **"Complete"**
4. Click **"Apply"** (top right corner)

---

## Method 2: Backend Validation (Already Implemented)

The backend middleware has been updated to verify email domain on every API request.

**File:** `backend/middleware/auth.js`

**What it does:**
- Checks if user's email ends with `@klh.edu.in`
- Returns `403 Forbidden` if domain doesn't match
- Shows message: "Access restricted to @klh.edu.in email addresses only"

---

## Testing the Restriction

### Test 1: Try with Non-KLH Email

1. Try to sign up/login with a Gmail account (e.g., `test@gmail.com`)
2. **Expected Result:** 
   - Auth0 will show an error: "Access restricted to @klh.edu.in email addresses only"
   - Login will be blocked before reaching your application

### Test 2: Try with KLH Email

1. Login with a `@klh.edu.in` email address
2. **Expected Result:**
   - ✅ Login succeeds
   - User is created in database
   - Can access all protected routes

---

## How It Works

### Two-Layer Security:

1. **Auth0 Action (First Layer - Recommended):**
   - Blocks users at Auth0 login screen
   - User never gets a token if email domain is wrong
   - Better user experience (immediate feedback)
   - No API calls wasted

2. **Backend Middleware (Second Layer - Already Active):**
   - Validates email domain on every API request
   - Extra security in case Auth0 action is bypassed
   - Returns 403 error if domain doesn't match

---

## Auth0 Connection Settings (Optional - For Email/Password Sign-ups)

If you're using **Email/Password (Database) Connection**:

1. Go to **Authentication** → **Database** → **Username-Password-Authentication**
2. Click on **Settings** tab
3. Under **"Signup"** section, you can add custom validation
4. However, the **Action method above is better** as it works for all connection types (Google, Email, etc.)

---

## Configuration for Social Logins (Google, etc.)

If you want to allow **Google Sign-In** but only for `@klh.edu.in` accounts:

1. The **Auth0 Action** will automatically work for Google logins
2. Users can sign in with their Google account (`someone@klh.edu.in`)
3. Action checks the email domain and allows/denies accordingly
4. No additional configuration needed!

---

## Current Status

✅ **Backend validation:** ACTIVE (already implemented)
⏳ **Auth0 Action:** Follow steps above to activate

---

## Verification Checklist

- [ ] Auth0 Action created and deployed
- [ ] Action added to Login Flow (dragged between Start and Complete)
- [ ] Action flow "Applied"
- [ ] Backend middleware updated (already done)
- [ ] Tested with non-KLH email (should be blocked)
- [ ] Tested with @klh.edu.in email (should work)
- [ ] Checked Auth0 logs for "unauthorized_domain" error

---

## Troubleshooting

**Q: I added the action but non-KLH emails can still login**
- Make sure you clicked **"Apply"** after dragging the action to the flow
- Check if the action is showing in the flow diagram
- Verify the action is **deployed** (not in draft)

**Q: All logins are blocked, even KLH emails**
- Check the action code for typos
- Verify `allowedDomain` is set to `'klh.edu.in'` (no @ symbol)
- Check Auth0 logs for error details

**Q: Where do I see rejection logs?**
- Go to **Monitoring** → **Logs** in Auth0 Dashboard
- Look for events with type `fapi` (Failed API operation)
- Click on the log entry to see the denial reason

---

## Support

If users from `@klh.edu.in` report login issues:
1. Check Auth0 Logs: **Monitoring** → **Logs**
2. Verify email is verified in Auth0
3. Check backend logs for 403 errors
4. Ensure Auth0 Action is not blocking verified KLH emails

---

**Implementation Complete!** 🎉

Your CampusStream platform now only allows access to users with `@klh.edu.in` email addresses.
