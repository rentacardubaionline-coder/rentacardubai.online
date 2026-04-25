// One-time helper: generate a VAPID keypair for web-push.
// Run once per environment and paste the output into .env.local and Vercel.
//
//   node scripts/generate-vapid-keys.mjs

import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("\nAdd these to your .env.local AND to Vercel project env:\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_SUBJECT=mailto:help@rentnowpk.com`);
console.log("\nVAPID_PRIVATE_KEY must stay secret — never commit it.\n");
