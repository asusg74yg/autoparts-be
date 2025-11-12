import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const promotionSchema = z.object({
  title: z.string(),
  imageUrl: z.string().url().optional(),
});

export type PromotionSchemaType = z.infer<typeof promotionSchema>;
export class ProductSchemaDTO extends createZodDto(promotionSchema) {}
