import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const ReviewSchema = z.object({
  userId: z.string().min(4).optional(),
  productId: z.string().min(4),
  rating: z
    .string()
    .min(1)
    .transform((val) => parseInt(val)),
  comment: z.string().min(3),
});

export type ReviewSchemaType = z.infer<typeof ReviewSchema>;

export class ReviewSchemaDTO extends createZodDto(ReviewSchema) {}
