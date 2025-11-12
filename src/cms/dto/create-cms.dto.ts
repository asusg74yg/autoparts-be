import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const CmsSchema = z.object({
  slug: z.string().min(3),
  title: z.string().min(3),
  //   imageUrl: z.string().min(4).optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']).optional(),
  content: z.string().min(3),
});

export type CmsSchemaType = z.infer<typeof CmsSchema>;
export class CmsSchemaDTO extends createZodDto(CmsSchema) {}
