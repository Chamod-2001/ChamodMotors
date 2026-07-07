import { describe, it, expect } from 'vitest';
import {
  validateNewPassword,
  validateCustomerInput,
  validateVehicleInput,
  validateSaleInput,
  validateFinanceOfficerInput,
} from './validation';

describe('validateNewPassword', () => {
  it('rejects passwords shorter than 8 characters', () => {
    expect(validateNewPassword('abc123', 'abc123')).toMatch(/8/);
  });

  it('rejects mismatched password/confirmation', () => {
    expect(validateNewPassword('password1', 'password2')).toMatch(/match/i);
  });

  it('accepts a valid, matching 8+ character password', () => {
    expect(validateNewPassword('password1', 'password1')).toBeNull();
  });
});

describe('validateCustomerInput', () => {
  it('requires full name', () => {
    expect(
      validateCustomerInput({ full_name: '', nic_number: '912345678V', phone_number: '0771234567' })
    ).not.toBeNull();
  });

  it('requires NIC number', () => {
    expect(
      validateCustomerInput({ full_name: 'Kasun Perera', nic_number: '', phone_number: '0771234567' })
    ).not.toBeNull();
  });

  it('requires phone number', () => {
    expect(
      validateCustomerInput({ full_name: 'Kasun Perera', nic_number: '912345678V', phone_number: '' })
    ).not.toBeNull();
  });

  it('rejects whitespace-only fields (not just empty strings)', () => {
    expect(
      validateCustomerInput({ full_name: '   ', nic_number: '912345678V', phone_number: '0771234567' })
    ).not.toBeNull();
  });

  it('passes when all required fields are present', () => {
    expect(
      validateCustomerInput({ full_name: 'Kasun Perera', nic_number: '912345678V', phone_number: '0771234567' })
    ).toBeNull();
  });
});

describe('validateVehicleInput', () => {
  it('requires brand', () => {
    expect(validateVehicleInput({ brand: '', model: 'Wave 125' })).not.toBeNull();
  });

  it('requires model', () => {
    expect(validateVehicleInput({ brand: 'Honda', model: '' })).not.toBeNull();
  });

  it('passes when brand and model are present', () => {
    expect(validateVehicleInput({ brand: 'Honda', model: 'Wave 125' })).toBeNull();
  });
});

describe('validateSaleInput', () => {
  it('requires a vehicle', () => {
    expect(validateSaleInput({ vehicleId: '', salePrice: 500000 })).not.toBeNull();
  });

  it('requires a sale price', () => {
    expect(validateSaleInput({ vehicleId: 'v1', salePrice: 0 })).not.toBeNull();
  });

  it('rejects a negative sale price', () => {
    expect(validateSaleInput({ vehicleId: 'v1', salePrice: -1000 })).not.toBeNull();
  });

  it('passes for a valid vehicle + positive price', () => {
    expect(validateSaleInput({ vehicleId: 'v1', salePrice: 500000 })).toBeNull();
  });

  it('accepts a numeric string price (as raw FormData values arrive as strings)', () => {
    expect(validateSaleInput({ vehicleId: 'v1', salePrice: '500000' })).toBeNull();
  });
});

describe('validateFinanceOfficerInput', () => {
  it('requires a finance company', () => {
    expect(validateFinanceOfficerInput({ finance_company_id: '', officer_name: 'Nimal' })).not.toBeNull();
  });

  it('requires an officer name', () => {
    expect(validateFinanceOfficerInput({ finance_company_id: 'fc1', officer_name: '' })).not.toBeNull();
  });

  it('passes when both are present', () => {
    expect(validateFinanceOfficerInput({ finance_company_id: 'fc1', officer_name: 'Nimal' })).toBeNull();
  });
});
