import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const signInSchema = z.object({
  password: z.string().min(4),
  email: z.string().email().min(4),
});

export type SignInSchema = z.infer<typeof signInSchema>;
export class SignInSchemaDTO extends createZodDto(signInSchema) {}
