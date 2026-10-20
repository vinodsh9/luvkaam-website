export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/api/register" && request.method === "OPTIONS") return new Response(null,{status:204,headers:corsHeaders(request)});
  if (url.pathname === "/api/register" && request.method === "POST") {
   const headers = {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...corsHeaders(request)};
   const reply=(body,status=200)=>new Response(JSON.stringify(body),{status,headers});
   if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  return reply({
    error: "Missing runtime binding",
    supabaseUrlPresent: Boolean(env.SUPABASE_URL),
    serviceRoleKeyPresent: Boolean(env.SUPABASE_SERVICE_ROLE_KEY) }, 503);
   let body; try { body=await request.json(); } catch { return reply({error:"Invalid JSON request."},400); }
   const name=String(body.name||"").trim(), email=String(body.email||"").trim().toLowerCase(), phone=String(body.phone||"").trim();
   if(name.length<2||name.length>80) return reply({error:"Enter a name between 2 and 80 characters."},400);
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({error:"Enter a valid email address."},400);
   if(!/^[+0-9() .-]{8,20}$/.test(phone)) return reply({error:"Enter a valid phone number."},400);
   if(body.privacyConsent!==true) return reply({error:"Privacy and terms acknowledgement is required."},400);
   const now=new Date().toISOString(), version=String(body.consentVersion||"2026-10-20-v1");
   const base=env.SUPABASE_URL.replace(/\/$/,""); const key=env.SUPABASE_SERVICE_ROLE_KEY;
   const headersSup={apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",Prefer:"return=minimal"};
   try {
    // Invite creates/locates an auth account and sends the configured invitation/verification email.
    const invite=await fetch(`${base}/auth/v1/invite`,{method:"POST",headers:headersSup,body:JSON.stringify({email,data:{full_name:name,phone}})});
    let authData={}; try{authData=await invite.json()}catch{}
    if(!invite.ok && !(invite.status===422 && /already|registered|exists/i.test(JSON.stringify(authData)))) return reply({error:authData.msg||authData.message||authData.error_description||"Could not create/invite account. Check Supabase Auth settings."},502);
    const userId=authData.id||authData.user?.id;
    if(userId){
      const profile=await fetch(`${base}/rest/v1/profiles`,{method:"POST",headers:{...headersSup,Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id:userId,full_name:name,email,phone,created_at:now})});
      if(!profile.ok) return reply({error:"Auth invite was processed, but profile storage failed. Check the Supabase profiles table/schema."},502);
      const consents=[{user_id:userId,consent_type:"privacy_terms",granted:true,consent_version:version,source:"website_registration",captured_at:now},{user_id:userId,consent_type:"marketing",granted:body.marketingConsent===true,consent_version:version,source:"website_registration",captured_at:now}];
      const cr=await fetch(`${base}/rest/v1/consent_events`,{method:"POST",headers:headersSup,body:JSON.stringify(consents)});
      if(!cr.ok) return reply({error:"Account was processed, but consent storage failed. Check consent_events schema."},502);
      return reply({message:"Registration request saved. Check your email for the invitation or verification link."},201);
    }
    return reply({error:"Supabase did not return a user ID, so registration was not confirmed as saved."},502);
   } catch(e){return reply({error:"Registration service could not reach Supabase."},502)}
  }
  return env.ASSETS.fetch(request);
 }
};
function corsHeaders(request){return {"Access-Control-Allow-Origin":new URL(request.url).origin,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"}}
