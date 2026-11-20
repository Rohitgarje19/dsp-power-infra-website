# Turn on enquiry emails — free with Brevo

The desk can already store recipients; this guide connects a real mail server so the emails actually leave. Brevo's free plan (about 300 emails a day at the time of writing) is enough for website enquiries and needs no payment method for the free tier.

No code changes are needed — the backend already speaks standard SMTP. You only add a few settings on the machine that runs the backend.

## 1. Create the free Brevo account

1. Sign up at <https://www.brevo.com> using the inbox that should own the account (for example `jskam555@gmail.com`).
2. Open the confirmation email and finish the sign-up. This step needs the inbox owner; it cannot be done from the project.

## 2. Verify the sender address

1. In Brevo go to **Transactional → Senders & Domains**.
2. Add the address that will appear as the sender, for example `jskam555@gmail.com`.
3. Click the verification link Brevo emails you. A whole domain is not required for this free setup.

The address you verify here must be exactly what you put in `NOTIFY_FROM`.

## 3. Create the SMTP key

1. Go to **SMTP & API → SMTP** tab (not the API-keys tab).
2. Note the server: `smtp-relay.brevo.com`, port `587`.
3. Generate an **SMTP key**. Treat it like a password: it is different from the API key, it is shown once, and it must never be committed or pasted into chat.

## 4. Set the environment variables

Set these wherever the backend starts (locally, and later on the hosting server):

```
NOTIFY_ENABLED=true
NOTIFY_FROM=jskam555@gmail.com        # the address verified in step 2
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USERNAME=your-brevo-login@example.com
SMTP_PASSWORD=<the SMTP key from step 3>
SITE_URL=https://your-public-site.example  # for the "Open enquiry desk" button
```

`NOTIFY_TO` is optional: it adds one server-level fallback inbox on top of the addresses managed in the desk. Duplicates are removed automatically. `SITE_URL` is optional too: without it the alert still arrives, just without the desk button.

Locally, the project keeps these values in `backend/.env.local` (gitignored). Start the backend with `powershell -ExecutionPolicy Bypass -File scripts/start-backend.ps1` and it loads that file automatically, so mail stays on across restarts. Never commit `.env.local`.

## 5. Restart and test

1. Restart the backend so it reads the new values.
2. Open `/admin` → **Email alerts for new enquiries**. The status should now read that alerts are on.
3. Press **Send test email**. A successful result names how many addresses received it; a failure now explains the reason in plain words (for example a rejected login or an unverified sender).
4. Submit a real enquiry from the public site and confirm it arrives.

## If something fails

| What the desk says | What to check |
|---|---|
| "Email alerts are not switched on yet" | `NOTIFY_ENABLED` / `SMTP_HOST` were not visible to the backend; restart it after setting them. |
| Login rejected | Use the SMTP key, not the API key, and the exact Brevo login as `SMTP_USERNAME`. |
| Sender not verified / not allowed | Verify `NOTIFY_FROM` under Senders & Domains. |
| Daily limit reached | Free Brevo allows roughly 300 emails a day; enquiries above that wait until the next day. |
| Delivered to spam | Expected with a free `@gmail.com` sender; a verified domain with SPF/DKIM fixes it later. |

## Notes

- Free-tier limits and provider features change; confirm them in Brevo's dashboard before relying on the numbers.
- Keys belong in server environment variables only. Rotate the SMTP key if it is ever exposed.
- Because this is plain SMTP, switching to another provider (Resend, Mailgun, Amazon SES, Google Workspace) later is a configuration change, not a rewrite.
- When the site is deployed, repeat step 4 on the production host; local values are not carried over.
