import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(5, "Message is too short").max(2000),
});

const OWNER_EMAIL = "ahmadkaimkhani40@gmail.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo";

function esc(v: string) {
  return v.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("contact_messages")
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to store contact message:", error.message);
      throw new Error("Could not save your message. Please try again.");
    }

    let emailed = false;
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const brevoKey = process.env["BREVO_API_KEY"];

    if (lovableKey && brevoKey) {
      try {
        const res = await fetch(`${GATEWAY_URL}/smtp/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": brevoKey,
          },
          body: JSON.stringify({
            sender: { name: "Portfolio Contact Form", email: OWNER_EMAIL },
            to: [{ email: OWNER_EMAIL, name: "Muhammad Ahmed" }],
            replyTo: { email: data.email, name: data.name },
            subject: data.subject
              ? `Portfolio: ${data.subject}`
              : `New message from ${data.name}`,
            htmlContent: `
              <div style="font-family:Arial,sans-serif;color:#111">
                <h2>New portfolio message</h2>
                <p><strong>Name:</strong> ${esc(data.name)}</p>
                <p><strong>Email:</strong> ${esc(data.email)}</p>
                ${data.subject ? `<p><strong>Subject:</strong> ${esc(data.subject)}</p>` : ""}
                <p><strong>Message:</strong></p>
                <p style="white-space:pre-wrap">${esc(data.message)}</p>
              </div>`,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(`Brevo send failed [${res.status}]: ${body}`);
        } else {
          emailed = true;
          await supabaseAdmin
            .from("contact_messages")
            .update({ emailed: true })
            .eq("id", row.id);
        }
      } catch (err) {
        console.error("Brevo request error:", err);
      }
    }

    return { ok: true, emailed };
  });
