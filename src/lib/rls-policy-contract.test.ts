import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

/**
 * These tests don't hit a live database (no Postgres available in CI). Instead
 * they statically check the RLS migration SQL so a future edit can't silently
 * remove row-level-security protection from a table, or accidentally let a
 * non-admin delete records that should be admin-only. This guards the exact
 * class of bug that's most dangerous in a multi-tenant-by-role system: an RLS
 * policy quietly regressing.
 */

const ALL_TABLES = [
  'profiles',
  'vehicles',
  'vehicle_images',
  'customers',
  'sales',
  'finance_companies',
  'finance_officers',
  'finance_communications',
  'documents',
  'reminders',
  'vehicle_edit_requests',
  'shop_reviews',
  'vehicle_catalog',
  'vehicle_expenses',
  'shop_profile_views',
];

// Tables where DELETE must be admin-only per the spec (sales employees can
// create/read/update day-to-day records, but shouldn't be able to permanently
// remove them).
const ADMIN_ONLY_DELETE_TABLES = [
  'profiles',
  'vehicles',
  'customers',
  'sales',
  'documents',
  'reminders',
  'vehicle_edit_requests',
  'shop_reviews',
  'vehicle_catalog',
  'vehicle_expenses',
  'shop_profile_views',
];

let rlsSql: string;

beforeAll(() => {
  // Tables added after the initial RLS migration live in their own files —
  // concatenate so they're all covered by the same checks.
  const rlsPath = path.resolve(__dirname, '../../supabase/migrations/0002_rls_policies.sql');
  const remindersRlsPath = path.resolve(__dirname, '../../supabase/migrations/0012_reminders.sql');
  const editRequestsRlsPath = path.resolve(__dirname, '../../supabase/migrations/0014_vehicle_edit_requests.sql');
  const reviewsRlsPath = path.resolve(__dirname, '../../supabase/migrations/0016_shop_reviews.sql');
  const traceabilityRlsPath = path.resolve(__dirname, '../../supabase/migrations/0017_vehicle_traceability.sql');
  const expensesRlsPath = path.resolve(__dirname, '../../supabase/migrations/0018_vehicle_expenses.sql');
  const profileViewsRlsPath = path.resolve(__dirname, '../../supabase/migrations/0023_shop_profile_views.sql');
  rlsSql =
    readFileSync(rlsPath, 'utf-8') +
    '\n' +
    readFileSync(remindersRlsPath, 'utf-8') +
    '\n' +
    readFileSync(editRequestsRlsPath, 'utf-8') +
    '\n' +
    readFileSync(reviewsRlsPath, 'utf-8') +
    '\n' +
    readFileSync(traceabilityRlsPath, 'utf-8') +
    '\n' +
    readFileSync(expensesRlsPath, 'utf-8') +
    '\n' +
    readFileSync(profileViewsRlsPath, 'utf-8');
});

describe('RLS migration: every table has row-level security enabled', () => {
  it.each(ALL_TABLES)('enables RLS on "%s"', (table) => {
    const pattern = new RegExp(`alter table ${table} enable row level security`, 'i');
    expect(rlsSql).toMatch(pattern);
  });
});

describe('RLS migration: sensitive tables restrict DELETE to admins', () => {
  it.each(ADMIN_ONLY_DELETE_TABLES)('"%s" DELETE policy checks is_admin()', (table) => {
    // Find the "for delete" policy block for this specific table and confirm
    // it references is_admin() — not just any policy on the table. Capture
    // everything up to the statement-terminating semicolon (non-greedy),
    // since the USING clause itself contains nested parens like is_admin().
    const deletePolicyPattern = new RegExp(
      `create policy "[^"]*"\\s+on ${table}\\s+for delete\\s+using \\([\\s\\S]*?\\);`,
      'i'
    );
    const match = rlsSql.match(deletePolicyPattern);
    expect(match, `expected a DELETE policy on "${table}"`).not.toBeNull();
    expect(match![0]).toMatch(/is_admin\(\)/);
  });
});

describe('RLS migration: helper functions exist', () => {
  it('defines is_admin()', () => {
    expect(rlsSql).toMatch(/create or replace function public\.is_admin\(\)/);
  });

  it('defines is_active_employee()', () => {
    expect(rlsSql).toMatch(/create or replace function public\.is_active_employee\(\)/);
  });
});
