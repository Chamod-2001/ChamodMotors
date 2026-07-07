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
];

// Tables where DELETE must be admin-only per the spec (sales employees can
// create/read/update day-to-day records, but shouldn't be able to permanently
// remove them).
const ADMIN_ONLY_DELETE_TABLES = ['profiles', 'vehicles', 'customers', 'sales', 'documents'];

let rlsSql: string;

beforeAll(() => {
  const rlsPath = path.resolve(__dirname, '../../supabase/migrations/0002_rls_policies.sql');
  rlsSql = readFileSync(rlsPath, 'utf-8');
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
