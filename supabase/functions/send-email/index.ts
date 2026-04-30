import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  try {
    const { email, name, position } = await req.json();

    const data = await resend.emails.send({
      from: "Double A Alliance <noreply@yourdomain.com>",
      to: [email],
      subject: "Application Received - Double A Alliance",
      html: `
        <h1>Dear ${name},</h1>
        <p>Thank you for applying for the position of <strong>${position}</strong> at Double A Alliance.</p>
        <p>We have received your application successfully. Our recruitment team will review your profile and get back to you shortly.</p>
        <br />
        <p>Best regards,</p>
        <p>Human Resources Team</p>
        <p>Double A Alliance</p>
      `,
    });

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
