import * as z from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
export const OrderItem = z.object({
  productId: z.string().min(4),
  quantity: z
    .string()
    .min(1)
    .transform((val) => parseInt(val)),
  price: z
    .string()
    .min(1)
    .transform((val) => parseFloat(val)),
});
export const CheckoutInfo = z.object({
  shipping_fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters'),
  shipping_email: z.string().email('Invalid email address'),
  shipping_address: z
    .string()
    .min(10, 'Address must be at least 10 characters'),
  shipping_city: z.string().min(3, 'City must be at least 3 characters'),
  shipping_state: z.string().min(2, 'State must be at least 2 characters'),
  shipping_zipCode: z
    .string()
    .min(5, 'Zip code must be at least 5 characters')
    .max(5)
    .refine((val) => !isNaN(Number(val)), {
      message: 'Invalid zip code',
    }),
  shipping_country: z.string().min(3, 'Country must be at least 3 characters'),
  shipping_phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(15)
    .refine((iss) => {
      const phoneNumberPattern =
        /^\+?[0-9]{1,3}?[-.\s]?\(?[0-9]{1,4}\)?([-.\s]?[0-9]{1,9}){1,4}$/;
      return !phoneNumberPattern.test(`${iss}`)
        ? 'Invalid phone number'
        : 'Invalid phone number length';
    }),
  billing_fullName: z.string().optional(),
  billing_email: z.string().optional(),
  billing_address: z.string().optional(),
  billing_city: z.string().optional(),
  billing_state: z.string().optional(),
  billing_zipCode: z.string().optional(),
  billing_country: z.string().optional(),
  billing_phone: z
    .string()
    .optional()
    .refine((iss) => {
      const phoneNumberPattern =
        /^\+?[0-9]{1,3}?[-.\s]?\(?[0-9]{1,4}\)?([-.\s]?[0-9]{1,9}){1,4}$/;
      return !phoneNumberPattern.test(`${iss}`)
        ? 'Invalid phone number'
        : 'Invalid phone number length';
    }),
});
export const OrderSchema = z.object({
  orderProducts: z.array(OrderItem),
  additionalInfo: CheckoutInfo.optional(),
});

export enum ShippingStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}
export type OrderSchemaType = z.infer<typeof OrderSchema>;
export type OrderItemSchemaType = z.infer<typeof OrderItem>;
export class OrderSchemaDTO extends createZodDto(OrderSchema) {}
