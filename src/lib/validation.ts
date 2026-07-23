/**
 * Pure validation helpers used by server actions across the app.
 * Kept free of I/O (no Supabase calls) so they can be unit tested directly.
 * Each returns an error message string, or null when the input is valid.
 */

export function validateNewPassword(password: string, confirmPassword: string): string | null {
  if (password.length < 8) {
    return 'Password එක අවම වශයෙන් අකුරු 8ක් තිබිය යුතුයි / Minimum 8 characters';
  }
  if (password !== confirmPassword) {
    return 'Passwords match වෙන්නේ නෑ / Passwords do not match';
  }
  return null;
}

export interface CustomerInput {
  full_name: string;
  nic_number: string;
  phone_number: string;
}

export function validateCustomerInput(input: CustomerInput): string | null {
  if (!input.full_name.trim() || !input.nic_number.trim() || !input.phone_number.trim()) {
    return 'නම, NIC, සහ Phone Number ඕන / Name, NIC, and Phone are required';
  }
  return null;
}

export interface VehicleInput {
  brand: string;
  model: string;
}

export function validateVehicleInput(input: VehicleInput): string | null {
  if (!input.brand.trim() || !input.model.trim()) {
    return 'Brand සහ Model ඕන / Brand and Model are required';
  }
  return null;
}

export interface SaleInput {
  vehicleId: string;
  salePrice: number | string;
}

export function validateSaleInput(input: SaleInput): string | null {
  if (!input.vehicleId || !input.salePrice) {
    return 'වාහනය සහ මිල ඕන / Vehicle and sale price are required';
  }
  if (Number(input.salePrice) <= 0) {
    return 'මිල 0ට වඩා වැඩි විය යුතුයි / Sale price must be greater than 0';
  }
  return null;
}

export interface VehicleExpenseInput {
  amount: number | string;
}

export function validateVehicleExpenseInput(input: VehicleExpenseInput): string | null {
  if (!input.amount || Number(input.amount) <= 0) {
    return 'මුදල 0ට වඩා වැඩි විය යුතුයි / Amount must be greater than 0';
  }
  return null;
}

export interface FinanceOfficerInput {
  finance_company_id: string;
  officer_name: string;
}

export function validateFinanceOfficerInput(input: FinanceOfficerInput): string | null {
  if (!input.finance_company_id || !input.officer_name.trim()) {
    return 'Company සහ Officer නම ඕන / Company and officer name are required';
  }
  return null;
}
