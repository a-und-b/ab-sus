# Troubleshooting Production "Failed to fetch"

The error `Fetch failed loading: GET "https://ohsvzndgmefzvxyxubyq.supabase.co/rest/v1/participants?select=*&order=name.asc"` indicates that the browser is attempting to reach the correct URL but the request is being blocked or failing at the network level.

Since the URL itself is correct (`https://ohsvzndgmefzvxyxubyq.supabase.co`), the issue is likely one of the following:

1.  **Vercel Environment Variable Formatting (Most Likely)**
2.  **Content Security Policy (CSP)**
3.  **Network Blocking**

## Step 1: Verify Vercel Environment Variables (Critical)

Even though the URL looks correct in the error message, sometimes invisible characters or quotes in the environment variable can cause issues that look okay at first glance but fail in the browser fetch.

1.  Go to your **Vercel Dashboard** > **Project Settings** > **Environment Variables**.
2.  Find `VITE_SUPABASE_URL`.
3.  **Edit** it and verify:
    - **Value**: `https://ohsvzndgmefzvxyxubyq.supabase.co`
    - ⚠️ **Ensure there are NO QUOTES** around the value. Vercel treats everything in the value box as the string.
    - ⚠️ **Ensure no trailing slash** `/`.
    - ⚠️ **Ensure no leading/trailing spaces**.
4.  Find `VITE_SUPABASE_ANON_KEY`.
    - Verify it matches your `ENV_SETUP.md` or local `.env`.
    - Ensure **NO QUOTES** and no spaces.
5.  **Redeploy** your project (Deployment > Redeploy) for these changes to be baked into the build.

## Step 2: Check Network Response Details

1.  Open Developer Tools (F12) > **Network** tab.
2.  Refresh the page.
3.  Click on the failed `participants` request (in red).
4.  Look at the **Status Code**.
    - `(failed)` or `NS_BINDING_ABORTED`: Browser blocked it (likely adblocker or CSP).
    - `403 Forbidden`: Supabase rejected it (Auth/RLS or WAF).
    - `500 Internal Server Error`: Supabase server issue.
    - `200 OK` (but Console says failed): JSON parsing error?

## Step 3: Content Security Policy (CSP) check

If you have added any headers in `vercel.json` or meta tags in `index.html` restricting `connect-src`:

1.  Check the **Console** for any lines saying "Refused to connect to... because it violates the following Content Security Policy directive".
2.  If so, allow `https://ohsvzndgmefzvxyxubyq.supabase.co` in your CSP `connect-src`.

## Step 4: Browser Extension Test

1.  Try opening the site in **Incognito/Private Mode** (disables most extensions).
2.  If it works, an extension (like uBlock Origin or Privacy Badger) might be blocking Supabase calls.

## Step 5: Direct URL Test

1.  Click this link: [https://ohsvzndgmefzvxyxubyq.supabase.co/rest/v1/](https://ohsvzndgmefzvxyxubyq.supabase.co/rest/v1/)
2.  You should see a JSON response (e.g., `{"message":"..."}` or `{"swagger":"2.0"...}`).
3.  If this loads, your network can reach Supabase.
4.  If this fails (timeout/connection error), your network (VPN/Firewall) is blocking Supabase.

## Step 6: Quick Mobile Test

Try opening the site on your **Mobile Phone** (disconnect from Wi-Fi, use 4G/5G).
- If it works on mobile but not desktop, it's definitely a network/firewall issue on your desktop/Wi-Fi.


---

**Summary:**
Please double-check **Step 1** (Vercel Env Vars) carefully. It is the most common cause of production fetch failures when code works locally.

