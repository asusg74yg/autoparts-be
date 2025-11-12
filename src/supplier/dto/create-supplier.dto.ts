import { createZodDto } from '@anatine/zod-nestjs';
// import { ProductSchema } from 'src/product/dto/create-product.dto';
import { z } from 'zod';

const SupplierSchema = z.object({
  name: z.string().min(4),
  emailAddress: z.string().min(4),
  brandLabel: z.string().min(4),
  contact: z.string().min(4),
});

export type SupplierSchemaType = z.infer<typeof SupplierSchema>;
export class SupplierSchemaDTO extends createZodDto(SupplierSchema) {}
export { SupplierSchema };
