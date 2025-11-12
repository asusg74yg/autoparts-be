import { z } from 'zod';
import { RoleEnum } from 'common/enum/role.enum';
import { createZodDto } from '@anatine/zod-nestjs';

export const UserSchema = z.object({
  id: z.string().uuid(),

  role: RoleEnum,

  businessName: z.string().optional().nullable(),
  contactName: z.string(),

  email: z.string().email(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  country: z.string().optional().nullable(),

  passwordHash: z.string(),

  refreshToken: z.string().optional().nullable(),

  otpCode: z.bigint().optional().nullable(),
  otpExpiresAt: z.coerce.date().optional().nullable(),

  emailVerified: z.boolean().default(false),
  approved: z.boolean().default(false),
});

export type User = z.infer<typeof UserSchema>;
export class UserSchemaDTO extends createZodDto(UserSchema) {}

export const UserUpdateSchema = UserSchema.partial();
export class UserUpdateSchemaDTO extends createZodDto(UserUpdateSchema) {}
