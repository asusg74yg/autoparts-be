import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
export const OrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'SHIPPED', 'DELIVERED', 'RETURNED']),
  trackingNumber: z.string().optional(),
  shippingCost: z.string().optional(),
});

export type OrderStatusSchemaType = z.infer<typeof OrderStatusSchema>;

export class OrderStatusSchemaDTO extends createZodDto(OrderStatusSchema) {}
