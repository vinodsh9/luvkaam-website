
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle browser preflight requests.
    if (
      url.pathname === "/api/register" &&
      request.method === "OPTIONS"
    ) {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request)
      });
    }

    if (
      url.pathname === "/api/register" &&
      request.method === "POST"
    ) {
      const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...corsHeaders(request)
      };

      const reply = (body, status = 200) =>
        new Response(JSON.stringify(body), { status, headers });

      // Verify Cloudflare runtime configuration.
      if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
        return reply({
          error: "Missing runtime binding",
          supabaseUrlPresent: Boolean(env.SUPABASE_URL),
          serviceRoleKeyPresent: Boolean(
            env.SUPABASE_SERVICE_ROLE_KEY
          )
        }, 503);
      }

      // Parse registration form.
      let body;

      try {
        body = await request.json();
      } catch {
        return reply({ error: "Invalid JSON request." }, 400);
      }

      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const phone = String(body.phone || "").trim();

      if (name.length < 2 || name.length > 80) {
        return reply({
          error: "Enter a name between 2 and 80 characters."
        }, 400);
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return reply({
          error: "Enter a valid email address."
        }, 400);
      }

      if (!/^[+0-9() .-]{8,20}$/.test(phone)) {
        return reply({
          error: "Enter a valid phone number."
        }, 400);
      }

      if (body.privacyConsent !== true) {
        return reply({
          error: "Privacy and terms acknowledgement is required."
        }, 400);
      }

      const now = new Date().toISOString();
      const version = String(
        body.consentVersion || "2026-10-20-v1"
      );

      const base = env.SUPABASE_URL.replace(/\/$/, "");
      const key = env.SUPABASE_SERVICE_ROLE_KEY;

      const supabaseHeaders = {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      };

      try {
        // Create/invite the Supabase Auth user.
        const invite = await fetch(
          `${base}/auth/v1/invite`,
          {
            method: "POST",
            headers: supabaseHeaders,
            body: JSON.stringify({
              email,
              data: {
                full_name: name,
                phone
              }
            })
          }
        );

        let authData = {};

        try {
          authData = await invite.json();
        } catch {
          // The response may not contain JSON.
        }

        if (!invite.ok) {
          // Do not assume an existing account was successfully
          // registered or that an invitation was sent.
          return reply({
            error:
              authData.msg ||
              authData.message ||
              authData.error_description ||
              "Supabase could not create the invitation. Check Auth settings and logs."
          }, invite.status === 429 ? 429 : 502);
        }

        const userId = authData.id || authData.user?.id;

        if (!userId) {
          return reply({
            error: "Supabase did not return a user ID. Check Auth logs."
          }, 502);
        }

        // Save/update the user profile.
        const profile = await fetch(
          `${base}/rest/v1/profiles`,
          {
            method: "POST",
            headers: {
              ...supabaseHeaders,
              Prefer: "resolution=merge-duplicates,return=minimal"
            },
            body: JSON.stringify({
              id: userId,
              full_name: name,
              email,
              phone,
              created_at: now
            })
          }
        );

        if (!profile.ok) {
          const detail = await profile.text();

          console.error("Luvkaam profile save failed", {
            status: profile.status,
            detail
          });

          return reply({
            error: "Account invitation was processed, but profile storage failed. Check the profiles table and Supabase logs."
          }, 502);
        }

        // Consent types must match schema.sql exactly.
        const consents = [
          {
            user_id: userId,
            consent_type: "privacy_notice_acknowledgement",
            granted: true,
            consent_version: version,
            source: "website_registration",
            captured_at: now
          },
          {
            user_id: userId,
            consent_type: "promotional_communications",
            granted: body.marketingConsent === true,
            consent_version: version,
            source: "website_registration",
            captured_at: now
          }
        ];

        const consentResponse = await fetch(
          `${base}/rest/v1/consent_events`,
          {
            method: "POST",
            headers: {
              ...supabaseHeaders,
              Prefer: "return=minimal"
            },
            body: JSON.stringify(consents)
          }
        );

        if (!consentResponse.ok) {
          const detail = await consentResponse.text();

          console.error("Luvkaam consent save failed", {
            status: consentResponse.status,
            detail
          });

          return reply({
            error: "Account and profile were processed, but consent storage failed. Check the consent_events table and Supabase logs."
          }, 502);
        }

        return reply({
          message: "Registration request saved. Check your email for the invitation or verification link."
        }, 201);

      } catch (error) {
        console.error("Luvkaam registration request failed", {
          message: String(error)
        });

        return reply({
          error: "Registration service could not complete the request. Check Worker logs."
        }, 502);
      }
    }

    // Serve the static website for other paths.
    return env.ASSETS.fetch(request);
  }
};

function corsHeaders(request) {
  return {
    "Access-Control-Allow-Origin": new URL(request.url).origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
