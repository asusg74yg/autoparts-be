import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const signUpSchema = z.object({
  contact_name: z.string().min(4).trim().toLowerCase(),
  password: z.string().min(4).trim().toLowerCase(),
  confirm_password: z.string().min(4).trim().toLowerCase(),
  email: z.string().email().min(4).trim().toLowerCase(),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
export class SignUpSchemaDTO extends createZodDto(signUpSchema) {}
