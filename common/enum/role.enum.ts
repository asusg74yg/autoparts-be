import { z } from 'zod';

export const RoleEnum = z.enum(['ADMIN', 'CUSTOMER', 'SUPPLIER']); // adjust values based on your actual Role enum
export enum Roles {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
}

export type Role = z.infer<typeof RoleEnum>;
