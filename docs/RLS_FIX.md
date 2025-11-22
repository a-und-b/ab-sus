# Fix RLS Policy for Participant Deletion

## Problem
The delete operation is being blocked by Row Level Security (RLS) policies in Supabase.

## Solution

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop the existing policy if it exists (optional, only if you want to replace it)
DROP POLICY IF EXISTS "Enable all access for public" ON participants;

-- Create a comprehensive policy that allows all operations for authenticated users
CREATE POLICY "Enable all access for authenticated users" 
ON participants 
FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- Alternative: If you want to allow public access (less secure but simpler)
-- CREATE POLICY "Enable all access for public" 
-- ON participants 
-- FOR ALL 
-- USING (true) 
-- WITH CHECK (true);
```

## Verify the Fix

After running the SQL:
1. Try deleting a participant again
2. Check the browser console - you should see "Successfully deleted participant"
3. The participant should disappear from the list

## Why This Happens

Supabase RLS policies need to explicitly allow DELETE operations. The original policy might have been:
- Only allowing SELECT/INSERT/UPDATE but not DELETE
- Not checking for authenticated users correctly
- Missing the `WITH CHECK` clause for DELETE operations

## Security Note

The policy above allows authenticated users to delete any participant. If you need more granular control (e.g., only admins can delete), you would need to:

1. Add a role column to your users table
2. Create a more specific policy like:
```sql
CREATE POLICY "Allow admin delete" 
ON participants 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);
```
