import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request: emails array is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      throw new Error(
        'RESEND_API_KEY not configured. Please set it in Supabase Edge Function secrets.'
      );
    }

    console.log(`Processing ${emails.length} email(s)...`);

    // Send emails via Resend API with individual error handling
    const results = await Promise.allSettled(
      emails.map(async (email: EmailPayload, index: number) => {
        try {
          console.log(`Sending email ${index + 1}/${emails.length} to ${email.to}`);

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: 'Selbst & Selig <noreply@andersundbesser.de>',
              to: email.to,
              subject: email.subject,
              html: email.html,
            }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            console.error(`Resend API error for ${email.to}:`, responseData);
            throw new Error(`Resend API error: ${JSON.stringify(responseData)}`);
          }

          console.log(`Successfully sent email to ${email.to}:`, responseData);
          return { success: true, to: email.to, data: responseData };
        } catch (error) {
          console.error(`Failed to send email to ${email.to}:`, error);
          return {
            success: false,
            to: email.to,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );

    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success);
    const failed = results.filter(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    );

    console.log(`Email batch complete: ${successful.length} succeeded, ${failed.length} failed`);

    return new Response(
      JSON.stringify({
        success: failed.length === 0,
        count: emails.length,
        successful: successful.length,
        failed: failed.length,
        results: results.map((r) =>
          r.status === 'fulfilled' ? r.value : { success: false, error: String(r.reason) }
        ),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const err = error as { message: string };
    console.error('Email function error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
