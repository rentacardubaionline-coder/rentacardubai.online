const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>RentNow</title>

</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:20px 32px;">
            <span style="font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
              RentNow
            </span>

          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
              RentNow · Dubai's car rental marketplace<br/>

              <a href="${SITE_URL}" style="color:#94a3b8;">rentacardubai.online</a>

            </p>

          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#0f172a;color:#ffffff;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;">${label}</a>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0f172a;">${text}</h2>`;
}

function para(text: string): string {
  return `<p style="margin:8px 0;font-size:15px;color:#475569;line-height:1.6;">${text}</p>`;
}

function highlight(text: string): string {
  return `<span style="color:#0f172a;font-weight:600;">${text}</span>`;
}

// ─── Admin templates ──────────────────────────────────────────────────────────

export function listingSubmittedAdmin(listingTitle: string, vendorName: string) {
  return {
    subject: `New listing to review: ${listingTitle}`,
    html: base(`
      ${heading("New listing submitted for approval")}
      ${para(`${highlight(vendorName)} has submitted a new listing:`)}
      ${para(`&ldquo;${highlight(listingTitle)}&rdquo;`)}
      ${para("Please review it in the admin dashboard.")}
      ${cta("Review listing", `${SITE_URL}/admin/listings`)}
    `),
  };
}

export function kycSubmittedAdmin(vendorName: string) {
  return {
    subject: `New KYC submission from ${vendorName}`,
    html: base(`
      ${heading("New KYC submission")}
      ${para(`${highlight(vendorName)} has submitted their identity documents for verification.`)}
      ${para("Review the Emirates ID and selfie in the admin dashboard.")}

      ${cta("Review KYC", `${SITE_URL}/admin/kyc`)}
    `),
  };
}

// ─── Vendor templates ─────────────────────────────────────────────────────────

export function listingApprovedVendor(listingTitle: string, listingSlug: string) {
  return {
    subject: `Your listing is live: ${listingTitle}`,
    html: base(`
      ${heading("Your listing is approved!")}
      ${para(`Great news! Your listing ${highlight(`"${listingTitle}"`)} has been reviewed and is now live on RentNow.`)}

      ${para("Renters can now find and contact you through the listing.")}
      ${cta("View listing", `${SITE_URL}/cars/${listingSlug}`)}
    `),
  };
}

export function listingRejectedVendor(listingTitle: string, reason: string) {
  return {
    subject: `Your listing needs updates: ${listingTitle}`,
    html: base(`
      ${heading("Listing needs attention")}
      ${para(`Your listing ${highlight(`"${listingTitle}"`)} was not approved.`)}
      ${reason ? `<div style="margin:16px 0;padding:16px;background:#fff7ed;border-left:3px solid #f97316;border-radius:4px;"><p style="margin:0;font-size:14px;color:#9a3412;"><strong>Reason:</strong> ${reason}</p></div>` : ""}
      ${para("Please update your listing and resubmit for approval.")}
      ${cta("Edit listing", `${SITE_URL}/vendor/listings`)}
    `),
  };
}

export function kycApprovedVendor() {
  return {
    subject: "Your identity has been verified — RentNow",
    html: base(`
      ${heading("Identity verified!")}
      ${para("Congratulations! Your KYC documents have been reviewed and your identity is now verified.")}
      ${para("A verified badge will appear on your business profile, building trust with renters.")}
      ${cta("Go to dashboard", `${SITE_URL}/vendor`)}
    `),
  };
}

export function kycRejectedVendor(reason: string) {
  return {
    subject: "Your KYC submission needs attention — RentNow",
    html: base(`
      ${heading("KYC verification unsuccessful")}
      ${para("We were unable to verify your identity with the documents submitted.")}
      ${reason ? `<div style="margin:16px 0;padding:16px;background:#fff1f2;border-left:3px solid #f43f5e;border-radius:4px;"><p style="margin:0;font-size:14px;color:#9f1239;"><strong>Reason:</strong> ${reason}</p></div>` : ""}
      ${para("Please resubmit with clearer documents.")}
      ${cta("Resubmit KYC", `${SITE_URL}/vendor/kyc`)}
    `),
  };
}

export function claimApprovedVendor(businessName: string) {
  return {
    subject: `Business claim approved: ${businessName}`,
    html: base(`
      ${heading("Your business is now live!")}
      ${para(`Your claim for ${highlight(businessName)} has been approved.`)}
      ${para("You can now manage your listings, view leads, and build your presence on RentNow.")}

      ${cta("Go to vendor dashboard", `${SITE_URL}/vendor`)}
    `),
  };
}

export function claimRejectedVendor(businessName: string) {
  return {
    subject: `Business claim not approved: ${businessName}`,
    html: base(`
      ${heading("Business claim not approved")}
      ${para(`Your claim for ${highlight(businessName)} could not be approved at this time.`)}
      ${para("Please contact support if you believe this is an error.")}
      ${cta("Contact support", `mailto:help@rentacardubai.online`)}

    `),
  };
}

export function vendorTermsAgreement(vendorName: string, agreedAt: string) {
  const date = new Date(agreedAt).toLocaleString("en-AE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Dubai",
  });
  return {
    subject: "Your RentNow Vendor Agreement — Confirmation",
    html: base(`
      ${heading("Agreement confirmed")}
      ${para(`Hi ${highlight(vendorName)},`)}
      ${para(`This email confirms that you accepted the RentNow Vendor Terms &amp; Platform Agreement on ${highlight(date)} (GST).`)}

      <div style="margin:20px 0;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:.05em;">Key Terms Summary</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0;font-size:14px;color:#475569;">Lead charge</p>
            </td>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">AED 5 per lead</p>

            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0;font-size:14px;color:#475569;">Billing cycle</p>
            </td>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Last day of each month</p>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">
              <p style="margin:0;font-size:14px;color:#475569;">Payment methods</p>
            </td>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Card / Bank Transfer</p>

            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;">
              <p style="margin:0;font-size:14px;color:#475569;">Response obligation</p>
            </td>
            <td style="padding:6px 0;text-align:right;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a;">Within 24 hours</p>
            </td>
          </tr>
        </table>
      </div>
      ${para("Keep this email as your record. The full agreement is available in your vendor dashboard at any time.")}
      ${para("If you have any questions about billing or your account, contact us at <a href='mailto:help@rentacardubai.online' style='color:#0f172a;'>help@rentacardubai.online</a>.")}


      ${cta("Go to dashboard", `${SITE_URL}/vendor`)}
    `),
  };
}
