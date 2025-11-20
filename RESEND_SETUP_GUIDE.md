# Resend Email Integration - Setup & Testing Guide

## Overview

This guide will help you complete the Resend email integration setup and perform end-to-end testing of the email sending functionality in the Admin Dashboard.

## Status

✅ **Edge Function Updated**: Enhanced error handling and logging  
⚠️ **RESEND_API_KEY**: Needs to be configured  
✅ **Admin Users**: Already created (holger@andersundbesser.de, daniela@andersundbesser.de)  
⚠️ **End-to-End Test**: Pending

---

## Step 1: Configure RESEND_API_KEY

### Option A: Using the Supabase Dashboard (Recommended)

1. **Get your Resend API Key:**
   - Visit [Resend Dashboard](https://resend.com/api-keys)
   - Create a new API key or copy an existing one
   - ⚠️ **Important**: Keep this key secure!

2. **Set the secret in Supabase:**
   - Go to [Supabase Dashboard > Project Settings > Edge Functions](https://supabase.com/dashboard/project/ohsvzndgmefzvxyxubyq/settings/functions)
   - Under "Function Secrets", add a new secret:
     - **Key**: `RESEND_API_KEY`
     - **Value**: Your Resend API key (e.g., `re_xxxxx...`)
   - Click "Save"

3. **Verify the domain (if not already done):**
   - In Resend Dashboard, verify the domain `andersundbesser.de`
   - Or use the test domain `onboarding@resend.dev` for initial testing

### Option B: Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Set the secret
supabase secrets set RESEND_API_KEY=your_api_key_here --project-ref ohsvzndgmefzvxyxubyq

# Verify it was set
supabase secrets list --project-ref ohsvzndgmefzvxyxubyq
```

---

## Step 2: Verify Domain Configuration

The edge function is configured to send from:

```
Selbst & Selig <noreply@andersundbesser.de>
```

**Required Actions:**

1. In [Resend Dashboard](https://resend.com/domains), verify that `andersundbesser.de` is added and verified
2. If not verified yet, you can:
   - Add DNS records to verify the domain (recommended)
   - Or temporarily use `onboarding@resend.dev` for testing by updating the edge function

**To use the test domain temporarily:**
Edit `/supabase/functions/send-email/index.ts` and change line 57:

```typescript
from: 'Selbst & Selig <onboarding@resend.dev>',
```

Then redeploy the function (see Step 4).

---

## Step 3: Test the Edge Function Directly

Before testing through the UI, verify the edge function works:

```bash
# Test with curl (replace with your actual project URL and anon key)
curl -X POST \
  'https://ohsvzndgmefzvxyxubyq.supabase.co/functions/v1/send-email' \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [{
      "to": "holger@andersundbesser.de",
      "subject": "Test Email from Supabase",
      "html": "<p>This is a test email from the send-email edge function.</p>"
    }]
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "count": 1,
  "successful": 1,
  "failed": 0,
  "results": [...]
}
```

---

## Step 4: Deploy Updated Edge Function (Optional)

If you made any changes to the edge function:

```bash
# Using Supabase CLI
supabase functions deploy send-email --project-ref ohsvzndgmefzvxyxubyq
```

Or deploy via the Supabase Dashboard:

1. Go to [Edge Functions](https://supabase.com/dashboard/project/ohsvzndgmefzvxyxubyq/functions)
2. Select `send-email` function
3. Deploy the latest version

---

## Step 5: End-to-End Test via Admin Dashboard

### 5.1 Access the Admin Dashboard

1. Navigate to: `http://localhost:3000/#/admin` (or your production URL)
2. Log in with: `holger@andersundbesser.de` (or `daniela@andersundbesser.de`)

### 5.2 Send a Test Email

1. **In the Admin Dashboard:**
   - Click on the "E-Mail Center" tab
   - Select a template (e.g., "1. Invitation Email")
   - Review the template in "Vorschau" mode

2. **Configure Recipients:**
   - In the "Versand Konsole" on the right:
   - Select "Einzelner Empfänger" from the dropdown
   - Choose "Holger Will" (or your test recipient)

3. **Send the Email:**
   - Click "Jetzt Senden"
   - Confirm the dialog
   - Wait for the success message

4. **Verify:**
   - Check the "Protokoll" section below for the sent email log
   - Check your email inbox for the received email
   - Verify the personalized variables are correctly replaced

### 5.3 Check the Email Logs

```sql
-- In Supabase SQL Editor
SELECT * FROM email_logs ORDER BY date DESC LIMIT 5;
```

---

## Troubleshooting

### RESEND_API_KEY not configured

**Error**: "RESEND_API_KEY not configured"  
**Solution**: Complete Step 1 above

### Domain not verified

**Error**: "Domain is not verified"  
**Solution**:

- Verify your domain in Resend Dashboard
- Or use `onboarding@resend.dev` for testing (see Step 2)

### Email not received

**Check:**

1. Spam folder
2. Resend Dashboard > Logs for delivery status
3. Supabase Edge Function logs:
   ```bash
   supabase functions logs send-email --project-ref ohsvzndgmefzvxyxubyq
   ```
4. Browser console for any client-side errors

### Authentication Issues

**Error**: Cannot log into admin  
**Solution**: Check that you're using the correct email and password for the admin account

---

## Edge Function Improvements (Completed)

The `send-email` edge function has been enhanced with:

✅ Better error handling with `Promise.allSettled`  
✅ Individual email error tracking  
✅ Comprehensive logging for debugging  
✅ Input validation  
✅ Detailed success/failure reporting

---

## Production Checklist

Before deploying to production:

- [ ] RESEND_API_KEY is set in Supabase Edge Function secrets
- [ ] Domain `andersundbesser.de` is verified in Resend
- [ ] Test email sent successfully via Admin Dashboard
- [ ] Email logs are being created in database
- [ ] Email templates are reviewed and finalized
- [ ] Edge function is deployed to production
- [ ] Production URL is updated in environment variables (if different from staging)

---

## Next Steps

After completing this setup:

1. **Test all email templates** with different recipient filters
2. **Update email content** as needed for the actual event
3. **Set up email scheduling** if needed (using the existing templates)
4. **Monitor Resend usage** to stay within your plan limits

---

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference/emails/send-email)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Edge Function Secrets](https://supabase.com/docs/guides/functions/secrets)

---

## Support

If you encounter issues:

1. Check the Resend Dashboard > Logs
2. Check Supabase Edge Function logs
3. Check the browser console for client-side errors
4. Review this guide's Troubleshooting section
