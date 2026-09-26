export type Role = 'OWNER' | 'MANAGER' | 'HELPER';

export type Permissions = {
  role: Role | null;
  canSell: boolean;
  canAdjustStock: boolean;
  canEditProducts: boolean;
  canManageCustomers: boolean;
  canSeeCost: boolean;
  canSeeReports: boolean;
  canVoidOrReturn: boolean;
  canManageStaff: boolean;
  canManageShop: boolean;
};

export function parseRole(value: string | null | undefined): Role | null {
  if (value === 'OWNER' || value === 'MANAGER' || value === 'HELPER') return value;
  return null;
}

export function permissionsFor(role: Role | null): Permissions {
  const owner = role === 'OWNER';
  const manager = role === 'MANAGER';
  const mgmt = owner || manager;
  return {
    role,
    canSell: !!role,
    canAdjustStock: !!role,
    canEditProducts: mgmt,
    canManageCustomers: mgmt,
    canSeeCost: mgmt,
    canSeeReports: mgmt,
    canVoidOrReturn: mgmt,
    canManageStaff: owner,
    canManageShop: owner,
  };
}
