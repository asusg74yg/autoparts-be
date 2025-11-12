import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const changePasswordSchema = z.object({
  otp: z.string().min(6),
  email: z.string().email().min(4),
  password: z.string(),
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export class ChangePasswordSchemaDTO extends createZodDto(
  changePasswordSchema,
) {}
