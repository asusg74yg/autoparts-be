import { ProductSchema } from './create-product.dto';
import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateProductSchema = ProductSchema.partial();

export type UpdateProductSchemaType = z.infer<typeof UpdateProductSchema>;
export class UpdateProductSchemaDTO extends createZodDto(UpdateProductSchema) {}
