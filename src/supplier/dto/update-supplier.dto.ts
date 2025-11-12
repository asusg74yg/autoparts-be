import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
import { SupplierSchema } from './create-supplier.dto';

export const UpdateSupplier = SupplierSchema.partial();
export type UpdateSupplierSchemaType = z.infer<typeof UpdateSupplier>;
export class UpdateSupplierSchemaDTO extends createZodDto(SupplierSchema) {}
