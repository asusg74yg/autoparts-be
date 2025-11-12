import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
import { EmailSchema } from './create-email.dto';

const UpdateEmailSchema = EmailSchema.partial();

export type UpdateEmailSchemaType = z.infer<typeof UpdateEmailSchema>;
export class UpdateEmailSchemaDTO extends createZodDto(UpdateEmailSchema) {}
export { UpdateEmailSchema };
