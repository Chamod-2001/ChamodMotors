import { createClient } from '@/lib/supabase/server';

export interface FinanceOfficerRow {
  id: string;
  officer_name: string;
  phone_number: string | null;
  whatsapp_number: string | null;
  notes: string | null;
  photo_path: string | null;
  finance_company_id: string;
  finance_company_name: string;
}

export interface FinanceCompanyGroup {
  id: string;
  name: string;
  logo_path: string | null;
  officers: FinanceOfficerRow[];
}

export async function listFinanceCompaniesWithOfficers(): Promise<FinanceCompanyGroup[]> {
  const supabase = await createClient();

  const { data: companies } = await supabase
    .from('finance_companies')
    .select('id, name, logo_path')
    .order('name', { ascending: true });

  const { data: officers } = await supabase
    .from('finance_officers')
    .select('id, officer_name, phone_number, whatsapp_number, notes, photo_path, finance_company_id')
    .order('officer_name', { ascending: true });

  const companyList = companies ?? [];
  const officerList = officers ?? [];

  return companyList.map((company) => ({
    id: company.id,
    name: company.name,
    logo_path: company.logo_path,
    officers: officerList
      .filter((o) => o.finance_company_id === company.id)
      .map((o) => ({ ...o, finance_company_name: company.name })),
  }));
}

export async function getFinanceOfficer(id: string): Promise<FinanceOfficerRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('finance_officers')
    .select('id, officer_name, phone_number, whatsapp_number, notes, photo_path, finance_company_id, finance_companies(name)')
    .eq('id', id)
    .single();

  if (!data) return null;

  type Row = {
    id: string;
    officer_name: string;
    phone_number: string | null;
    whatsapp_number: string | null;
    notes: string | null;
    photo_path: string | null;
    finance_company_id: string;
    finance_companies: { name: string } | { name: string }[] | null;
  };
  const row = data as unknown as Row;
  const company = Array.isArray(row.finance_companies) ? row.finance_companies[0] : row.finance_companies;

  return {
    id: row.id,
    officer_name: row.officer_name,
    phone_number: row.phone_number,
    whatsapp_number: row.whatsapp_number,
    notes: row.notes,
    photo_path: row.photo_path,
    finance_company_id: row.finance_company_id,
    finance_company_name: company?.name ?? '—',
  };
}

export interface CommunicationLogItem {
  id: string;
  note: string | null;
  created_at: string;
  officer_name: string | null;
  company_name: string | null;
  customer_name: string | null;
  vehicle_label: string | null;
  created_by_name: string | null;
}

export async function listFinanceCommunications(officerId?: string, limit = 30): Promise<CommunicationLogItem[]> {
  const supabase = await createClient();

  let request = supabase
    .from('finance_communications')
    .select(
      'id, note, created_at, finance_officers(officer_name, finance_companies(name)), customers(full_name), vehicles(brand, model), profiles(full_name)'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (officerId) {
    request = request.eq('finance_officer_id', officerId);
  }

  const { data } = await request;

  type Row = {
    id: string;
    note: string | null;
    created_at: string;
    finance_officers:
      | { officer_name: string; finance_companies: { name: string } | { name: string }[] | null }
      | { officer_name: string; finance_companies: { name: string } | { name: string }[] | null }[]
      | null;
    customers: { full_name: string } | { full_name: string }[] | null;
    vehicles: { brand: string; model: string } | { brand: string; model: string }[] | null;
    profiles: { full_name: string } | { full_name: string }[] | null;
  };

  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

  return ((data ?? []) as unknown as Row[]).map((row) => {
    const officer = one(row.finance_officers);
    const company = officer ? one(officer.finance_companies) : null;
    const customer = one(row.customers);
    const vehicle = one(row.vehicles);
    const creator = one(row.profiles);

    return {
      id: row.id,
      note: row.note,
      created_at: row.created_at,
      officer_name: officer?.officer_name ?? null,
      company_name: company?.name ?? null,
      customer_name: customer?.full_name ?? null,
      vehicle_label: vehicle ? `${vehicle.brand} ${vehicle.model}` : null,
      created_by_name: creator?.full_name ?? null,
    };
  });
}

export interface SimpleCustomer {
  id: string;
  full_name: string;
  nic_number: string;
  photo_path: string | null;
}

export async function listCustomersForFinancePicker(): Promise<SimpleCustomer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('customers')
    .select('id, full_name, nic_number, photo_path')
    .order('full_name', { ascending: true });
  return data ?? [];
}

export interface SimpleVehicle {
  id: string;
  label: string;
}

export async function listVehiclesForFinancePicker(): Promise<SimpleVehicle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('vehicles')
    .select('id, brand, model, registration_number')
    .order('brand', { ascending: true });

  return (data ?? []).map((v) => ({
    id: v.id,
    label: `${v.brand} ${v.model}${v.registration_number ? ` — ${v.registration_number}` : ''}`,
  }));
}

export interface SimpleFinanceOfficer {
  id: string;
  label: string;
}

export async function listFinanceOfficersForPicker(): Promise<SimpleFinanceOfficer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('finance_officers')
    .select('id, officer_name, finance_companies(name)')
    .order('officer_name', { ascending: true });

  type Row = { id: string; officer_name: string; finance_companies: { name: string } | { name: string }[] | null };
  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

  return ((data ?? []) as unknown as Row[]).map((row) => {
    const company = one(row.finance_companies);
    return { id: row.id, label: company ? `${row.officer_name} — ${company.name}` : row.officer_name };
  });
}
