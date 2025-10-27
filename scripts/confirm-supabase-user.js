#!/usr/bin/env node

/**
 * confirm-supabase-user.js
 *
 * Utility script to mark Supabase users as email-confirmed.
 * Usage:
 *   node scripts/confirm-supabase-user.js user@example.com
 *   node scripts/confirm-supabase-user.js user1@example.com user2@example.com
 *
 * Requirements:
 *   SUPABASE_SERVICE_ROLE_KEY   (service role key with admin privileges)
 *   SUPABASE_URL or VITE_SUPABASE_URL (project URL)
 */

import { createClient } from '@supabase/supabase-js';

const emails = process.argv.slice(2).map((value) => value.trim()).filter(Boolean);

if (emails.length === 0) {
  console.error('Usage: node scripts/confirm-supabase-user.js <email> [...additionalEmails]');
  process.exitCode = 1;
  process.exit();
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing environment variable: SUPABASE_URL (or VITE_SUPABASE_URL).');
  console.error('Set SUPABASE_URL to your Supabase project URL.');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY.');
  console.error('This script requires the Supabase service role key with admin privileges.');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const confirmUser = async (email) => {
  console.log(`\n=== Processing ${email} ===`);

  try {
    const { data, error } = await adminClient.auth.admin.getUserByEmail(email);

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    const user = data.user;

    if (!user) {
      console.error(`User not found: ${email}`);
      return false;
    }

    if (user.email_confirmed_at) {
      console.log(`Already confirmed at: ${user.email_confirmed_at}`);
      return true;
    }

    const { error: updateError, data: updateData } = await adminClient.auth.admin.updateUserById(
      user.id,
      { email_confirm: true },
    );

    if (updateError) {
      throw new Error(`Failed to confirm email: ${updateError.message}`);
    }

    const confirmedAt = updateData.user?.email_confirmed_at;
    console.log(
      confirmedAt
        ? `Confirmation succeeded. email_confirmed_at=${confirmedAt}`
        : 'Confirmation succeeded. Please verify the timestamp in Supabase Dashboard.',
    );

    return true;
  } catch (err) {
    console.error(`Error while confirming ${email}:`, err instanceof Error ? err.message : err);
    return false;
  }
};

const run = async () => {
  let successCount = 0;

  for (const email of emails) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await confirmUser(email);
    if (ok) {
      successCount += 1;
    }
  }

  const failureCount = emails.length - successCount;
  console.log('\n=== Summary ===');
  console.log(`Processed: ${emails.length}`);
  console.log(`Confirmed: ${successCount}`);
  console.log(`Failed: ${failureCount}`);

  if (failureCount > 0) {
    process.exit(1);
  }
};

run().catch((err) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : err);
  process.exit(1);
});

