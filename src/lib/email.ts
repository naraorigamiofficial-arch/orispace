// Sends email through Resend. Without an API key (development), the email is printed to the terminal.
export async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`\n--- Email to ${to} ---\nSubject: ${subject}\n\n${text}\n--- End of email ---\n`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "ORISPACE <onboarding@resend.dev>",
      to,
      subject,
      text,
    }),
  });
  if (!response.ok) {
    console.error("Email failed", response.status, await response.text());
    throw new Error("Email could not be sent");
  }
}

export function appUrl(path: string) {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const base =
    process.env.APP_URL || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");
  return new URL(path, base).toString();
}
