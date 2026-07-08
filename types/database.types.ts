// ============================================================
// MDMS — Database Types
// Mirrors supabase/migrations/0001_init_schema.sql
// Regenerate later with: supabase gen types typescript
// ============================================================

export type UserRole = 'admin' | 'sales';
export type VehicleStatus = 'available' | 'reserved' | 'sold';
export type VehicleType = 'motorcycle' | 'three_wheeler' | 'scooter' | 'other';
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid';
export type DocumentType = 'shop_letter' | 'sale_letter' | 'nic' | 'electricity_bill' | 'other';
export type ReminderStatus = 'pending' | 'done' | 'dismissed';

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  manufacturing_year: number | null;
  vehicle_type: VehicleType;
  registration_number: string | null;
  registration_number_normalized: string;
  engine_number: string | null;
  engine_number_normalized: string;
  chassis_number: string | null;
  chassis_number_normalized: string;
  mileage: number | null;
  fuel_type: FuelType | null;
  color: string | null;
  buying_price: number;
  selling_price: number;
  gross_profit: number;
  status: VehicleStatus;
  notes: string | null;
  buying_date: string;
  reserved_at: string | null;
  sold_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  storage_path: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  nic_number: string;
  phone_number: string;
  address: string | null;
  occupation: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  vehicle_id: string;
  customer_id: string;
  sold_by: string | null;
  sale_price: number;
  purchase_date: string;
  created_at: string;
}

export interface FinanceCompany {
  id: string;
  name: string;
  created_at: string;
}

export interface FinanceOfficer {
  id: string;
  finance_company_id: string;
  officer_name: string;
  phone_number: string | null;
  whatsapp_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface FinanceCommunication {
  id: string;
  finance_officer_id: string | null;
  customer_id: string | null;
  vehicle_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  document_type: DocumentType;
  storage_path: string;
  customer_id: string | null;
  vehicle_id: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export type ActivityType =
  | 'login'
  | 'logout'
  | 'vehicle_created'
  | 'vehicle_sold'
  | 'customer_created'
  | 'finance_contact'
  | 'document_uploaded'
  | 'document_deleted'
  | 'reminder_created';

export interface ActivityLog {
  id: string;
  employee_id: string | null;
  activity_type: ActivityType;
  description: string;
  created_at: string;
  read_at: string | null;
}

export interface ShopProfile {
  id: boolean;
  business_name: string;
  description: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  address: string | null;
  map_url: string | null;
  cover_photo_path: string | null;
  updated_at: string;
}

export interface ShopPhoto {
  id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
}

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'website' | 'other';

export interface ShopSocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface ShopLocation {
  id: string;
  label: string;
  address: string | null;
  map_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Reminder {
  id: string;
  title: string;
  note: string | null;
  due_at: string;
  status: ReminderStatus;
  vehicle_id: string | null;
  customer_id: string | null;
  finance_officer_id: string | null;
  created_by: string | null;
  created_at: string;
}

// Supabase generic Database interface (for typed client).
// Each table needs Row/Insert/Update/Relationships so the supabase-js
// query builder can correctly infer types instead of falling back to `never`.
//
// NOTE: the installed postgrest-js version only resolves selected columns
// correctly when a table's Row type is a *mapped type* (produced via Omit/
// Pick/etc.) rather than a bare named interface reference — otherwise every
// select() on that table silently resolves to `never`. `Simplify` forces
// this by re-mapping the interface through Omit<T, never>. Enum columns are
// additionally widened to `string` here (real unions stay in the exported
// types above and can be cast at read time, e.g. `profile.role as UserRole`).
type Simplify<T> = Omit<T, never>;
type WidenEnums<T, K extends keyof T> = Omit<T, K> & { [P in K]: null extends T[P] ? string | null : string };

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: string;
  };
  public: {
    Tables: {
      profiles: TableDef<WidenEnums<Profile, 'role'>>;
      vehicles: TableDef<WidenEnums<Vehicle, 'vehicle_type' | 'fuel_type' | 'status'>>;
      vehicle_images: TableDef<Simplify<VehicleImage>>;
      customers: TableDef<Simplify<Customer>>;
      sales: TableDef<Simplify<Sale>>;
      finance_companies: TableDef<Simplify<FinanceCompany>>;
      finance_officers: TableDef<Simplify<FinanceOfficer>>;
      finance_communications: TableDef<Simplify<FinanceCommunication>>;
      documents: TableDef<WidenEnums<Document, 'document_type'>>;
      activity_log: TableDef<WidenEnums<ActivityLog, 'activity_type'>>;
      shop_profile: TableDef<Simplify<ShopProfile>>;
      shop_photos: TableDef<Simplify<ShopPhoto>>;
      shop_social_links: TableDef<WidenEnums<ShopSocialLink, 'platform'>>;
      shop_locations: TableDef<Simplify<ShopLocation>>;
      reminders: TableDef<WidenEnums<Reminder, 'status'>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
