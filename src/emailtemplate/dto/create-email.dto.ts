import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const EmailSchema = z.object({
  name: z.string().min(4),
  subject: z.string().min(4),
  body: z.string().min(4),
});

export type EmailSchemaType = z.infer<typeof EmailSchema>;
export class EmailSchemaDTO extends createZodDto(EmailSchema) {}
export { EmailSchema };
