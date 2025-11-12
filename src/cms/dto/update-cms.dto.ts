import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { CmsSchema } from './create-cms.dto';

export const UpdateCmsSchema = CmsSchema.partial();

export type UpdateCmsSchemaType = z.infer<typeof UpdateCmsSchema>;
export class UpdateCmsSchemaDTO extends createZodDto(UpdateCmsSchema) {}
