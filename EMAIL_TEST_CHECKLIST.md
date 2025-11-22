# Email Functionality Test Checklist

## Quick Test Steps

### 1. Prerequisites Check

- [ ] RESEND_API_KEY configured in Supabase
- [ ] Domain verified in Resend (or using onboarding@resend.dev)
- [ ] Admin user credentials available
- [ ] Dev server running (`npm run dev`)

### 2. Access Admin Dashboard

- [ ] Navigate to `http://localhost:3000/#/admin`
- [ ] Login successful with admin credentials

### 3. Single Email Test

- [ ] Go to "E-Mail Center" tab
- [ ] Select template: "1. Invitation Email"
- [ ] Preview looks correct with personalized variables
- [ ] Set recipient to "Einzelner Empfänger"
- [ ] Select test recipient
- [ ] Click "Jetzt Senden"
- [ ] Success message appears
- [ ] Email log entry appears in "Protokoll"
- [ ] Email received in inbox (check spam folder)

### 4. Batch Email Test (Optional)

- [ ] Select recipient filter: "Offene Einladungen"
- [ ] Confirm recipient count is correct
- [ ] Send batch email
- [ ] All emails logged in "Protokoll"
- [ ] Sample email received correctly

### 5. Template Variables Test

Verify these variables work correctly in received emails:

- [ ] {{name}} - First name
- [ ] {{link}} - Personalized RSVP link
- [ ] {{date}} - Event date
- [ ] {{time}} - Event time
- [ ] {{location}} - Event location
- [ ] {{food}} - Selected food item
- [ ] {{cost}} - Cost per person
- [ ] {{plusOne}} - Plus one name

### 6. Error Handling Test

- [ ] Try sending without RESEND_API_KEY (should show error)
- [ ] Check browser console for detailed error messages
- [ ] Verify edge function logs show helpful debugging info

## Common Test Scenarios

### Scenario A: Welcome Email to New Guest

1. Add a new guest in "Gästeliste" tab
2. Send "1. Invitation Email" to the new guest
3. Verify guest receives personalized link

### Scenario B: Confirmation Email to Attendees

1. Filter recipients by "Nur Zusagen"
2. Send "2. Registration Confirmation"
3. Verify all attending guests receive it

### Scenario C: Reminder Before Event

1. Select "3. Follow-up (2 Weeks Before)"
2. Send to "Nur Zusagen"
3. Verify content includes correct event details

## Debugging Commands

### Check Email Logs in Database

```sql
SELECT
  id,
  date,
  template_name,
  recipient_count,
  recipients_preview,
  status
FROM email_logs
ORDER BY date DESC
LIMIT 10;
```

### Check Edge Function Logs

```bash
# If you have Supabase CLI
supabase functions logs send-email --project-ref ohsvzndgmefzvxyxubyq
```

### Test Edge Function Directly

```bash
curl -X POST \
  'https://ohsvzndgmefzvxyxubyq.supabase.co/functions/v1/send-email' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [{
      "to": "test@example.com",
      "subject": "Test",
      "html": "<p>Test email</p>"
    }]
  }'
```

## Success Criteria

✅ Email sent successfully via Admin Dashboard  
✅ Email received in inbox with correct formatting  
✅ Variables properly replaced with actual values  
✅ Email log entry created in database  
✅ Personalized RSVP link works  
✅ No errors in browser console  
✅ Edge function logs show successful sends

## Notes

- First email may take a few seconds to send
- Check spam folder if email not in inbox
- Resend has rate limits based on your plan
- Test with a small batch before sending to all guests
- Always preview emails before sending

## Production Deployment

Before going live:

1. Complete all test scenarios above
2. Review all email templates for typos
3. Verify domain is properly verified in Resend
4. Test on production URL (if different from dev)
5. Set appropriate rate limits if needed
6. Create backup of participant data
7. Send test batch to internal team first

---

Last Updated: 2025-11-20

