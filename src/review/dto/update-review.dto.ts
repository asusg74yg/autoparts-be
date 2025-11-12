import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { ReviewSchema } from './create-review.dto';

export const UpdateReviewSchema = ReviewSchema.partial();

export type UpdateReviewSchemaType = z.infer<typeof UpdateReviewSchema>;

export class UpdateReviewSchemaDTO extends createZodDto(UpdateReviewSchema) {}
