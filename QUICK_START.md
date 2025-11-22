# Quick Reference Card

## 🌐 Live URLs

- **App:** https://ab-m8iijasl2-a-und-bs-projects.vercel.app
- **Supabase:** https://supabase.com/dashboard/project/ohsvzndgmefzvxyxubyq
- **Vercel:** https://vercel.com/a-und-bs-projects/ab-sus

## 🔑 Critical Setup Steps

### 1. Add Secrets to Supabase (REQUIRED for AI features)

```bash
# In Supabase Dashboard > Project Settings > Edge Functions > Secrets
GEMINI_API_KEY = your_google_gemini_api_key
RESEND_API_KEY = your_resend_api_key
```

### 2. Create Admin User (REQUIRED for admin access)

In Supabase Dashboard > Authentication > Users > Invite User

- Email: your-admin@email.com
- They'll get a magic link to set password

### 3. Test the Deployment

Guest Pages (demo participants already in DB):

- Anna (attending): `/#/p/a3f7k9m2`
- Markus (pending): `/#/p/b8x2l1p9`
- Judith (pending): `/#/p/judith-demo`

Admin:

- Login: `/#/admin`
- Use your created admin credentials

## 💻 Local Development

```bash
npm run dev      # http://localhost:3000
npm run lint     # Check code quality
npm run format   # Format code
npm run test     # Run tests
npm run build    # Test production build
```

## 📦 What's Deployed

### Backend (Supabase)

- ✅ PostgreSQL database with 4 tables
- ✅ Row Level Security enabled
- ✅ 2 Edge Functions deployed:
  - `gemini-ai` (chatbot + avatar generation)
  - `send-email` (Resend integration)

### Frontend (Vercel)

- ✅ React SPA with hash routing
- ✅ Real-time database sync
- ✅ Secure authentication
- ✅ AI features via Edge Functions

## 🚨 Important Notes

1. **The app is live** but AI features need secrets configured
2. **Create admin user** before trying to access admin panel
3. **Environment variables** are set in Vercel automatically
4. **Demo links** in footer - consider removing for production
5. **Email sending** requires Resend API key in Supabase secrets

## 📞 Support Resources

- Full deployment guide: `DEPLOYMENT.md`
- Environment setup: `ENV_SETUP.md`
- Architecture docs: `docs/ARCHITECTURE.md`
- Database schema: `docs/DATA_MODEL.md`

---

**Status:** ✅ Production Ready (API keys needed for full functionality)

