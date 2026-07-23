// Sends transactional email via Brevo's REST API directly (fetch) rather than
// pulling in their SDK — this is the only email this app sends so far.
export async function sendSupportEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const supportInboxEmail = process.env.SUPPORT_INBOX_EMAIL;
  if (!apiKey || !senderEmail || !supportInboxEmail) {
    throw new Error("Brevo env vars are not set.");
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: "Woozi Support Form" },
      to: [{ email: supportInboxEmail }],
      replyTo: { email, name },
      subject: `Support request from ${name}`,
      textContent: `From: ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!res.ok) {
    throw new Error("Couldn't send your message. Please try again shortly.");
  }
}
