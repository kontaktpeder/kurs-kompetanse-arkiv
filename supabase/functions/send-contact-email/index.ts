// Edge Function: send-contact-email
// Sends a notification email to lbl@krap.no when a new lead/inquiry is submitted.
//
// REQUIRED SECRET: RESEND_API_KEY
// Add it via Lovable/Supabase Edge Function secrets.
// From-address uses verified domain: noreply@kurskragero.no

import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TO_EMAILS = ["lbl@krap.no", "kontaktpeder@gmail.com"];
const FROM = "Kurs Kragerø <noreply@kurskragero.no>";

interface Payload {
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  company?: string;
  participants?: string | number;
  language?: string;
  location?: string;
  timeframe?: string;
  message?: string;
  source?: string;
  leadId?: string;
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY secret");
      return new Response(
        JSON.stringify({ error: "Missing RESEND_API_KEY. Add it as a Supabase/Lovable secret." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const p = (await req.json()) as Payload;

    // Minimal validation: require name OR (email/phone), and some content
    const hasContact = !!(p.name?.trim() || p.email?.trim() || p.phone?.trim());
    if (!hasContact) {
      return new Response(JSON.stringify({ error: "Manglende kontaktinfo" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tidspunkt = new Date().toLocaleString("nb-NO", { timeZone: "Europe/Oslo" });

    const rows: [string, string | undefined][] = [
      ["Navn", p.name],
      ["E-post", p.email],
      ["Telefon", p.phone],
      ["Bedrift", p.company],
      ["Kurs/interesse", p.course],
      ["Antall deltakere", p.participants ? String(p.participants) : undefined],
      ["Foretrukket språk", p.language],
      ["Sted", p.location],
      ["Ønsket tidspunkt", p.timeframe],
      ["Kilde", p.source],
    ];

    const filled = rows.filter(([, v]) => v && String(v).trim());

    const text =
      `Ny forespørsel fra Kurs Kragerø\n\n` +
      filled.map(([k, v]) => `${k}: ${v}`).join("\n") +
      (p.message ? `\n\nMelding:\n${p.message}` : "") +
      `\n\nTidspunkt: ${tidspunkt}` +
      (p.leadId ? `\nLead-ID: ${p.leadId}` : "");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;color:#0B0D10;">
        <h2 style="background:#FFC400;color:#0B0D10;padding:12px 16px;margin:0;">Ny forespørsel fra Kurs Kragerø</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          ${filled
            .map(
              ([k, v]) => `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:bold;width:180px;">${escape(k)}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escape(String(v))}</td>
            </tr>`,
            )
            .join("")}
        </table>
        ${
          p.message
            ? `<div style="margin-top:16px;padding:12px;background:#f6f6f6;border-left:4px solid #FFC400;">
                 <strong>Melding:</strong><br/>
                 <div style="white-space:pre-wrap;margin-top:8px;">${escape(p.message)}</div>
               </div>`
            : ""
        }
        <p style="color:#666;font-size:12px;margin-top:24px;">Mottatt: ${escape(tidspunkt)}${
          p.leadId ? ` · Lead-ID: ${escape(p.leadId)}` : ""
        }</p>
      </div>`;

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO_EMAIL],
      replyTo: p.email?.trim() || undefined,
      subject: "Ny forespørsel fra Kurs Kragerø",
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-contact-email failed:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
