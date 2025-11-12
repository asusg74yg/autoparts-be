import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const ProductSchema = z.object({
  // Core product information
  mfrLabel: z.string().min(1),
  part: z.string().min(1),
  action: z.string().min(1),
  hazardMaterialCode: z.string().min(1),
  partNumber: z.string().min(1),
  brandLabel: z.string().min(1),
  acesApplications: z.string().min(1),
  itemQuantitySize: z.number().int().positive(),
  containerType: z.string().min(1),
  quantityPerApplication: z.number().int().positive(),
  minimumOrderQuantity: z.number().int().positive(),
  partTerminologyId: z.number().int().positive(),
  maintenanceType: z.string().min(1),

  // Vehicle relation fields (optional)
  baseVehicleId: z.string().uuid(),
  engineBaseId: z.string().uuid(),
  engineDesignationId: z.string().uuid(),
  engineVersionId: z.string().uuid(),
  engineMfrId: z.string().uuid(),
  fuelTypeId: z.string().uuid().optional(),
  brandAAIAIDId: z.string().uuid(),

  // Part type information
  partTypeId: z.number().int().positive().optional(),

  // Product descriptions (array of descriptions)
  productDescriptions: z
    .array(
      z.object({
        descriptionText: z.string().min(1),
        descriptionCode: z.string().min(1),
        maintenanceType: z.string().min(1),
        languageCode: z.string().min(1),
        sequence: z.number().int().positive(),
      }),
    )
    .optional(),

  // Pricing information (array of pricing)
  pricing: z
    .array(
      z.object({
        priceSheetNumber: z.string().min(1),
        currencyCode: z.string().min(1),
        price: z.number().positive(),
        priceType: z.string().min(1),
        maintenanceType: z.string().min(1),
      }),
    )
    .optional(),

  // Product attributes (array of attributes)
  productAttributes: z
    .array(
      z.object({
        attributeID: z.string().min(1),
        padbAttribute: z.string().min(1),
        recordNumber: z.number().int().positive(),
        multiValueQuantity: z.number().int().positive(),
        multiValueSequence: z.number().int().positive(),
        languageCode: z.string().min(1),
      }),
    )
    .optional(),

  // Extended product information
  extendedProductInformation: z
    .array(
      z.object({
        expiCode: z.string().min(1),
        descriptionText: z.string().min(1),
        maintenanceType: z.string().min(1),
        languageCode: z.string().min(1),
      }),
    )
    .optional(),

  // Package information
  package: z
    .object({
      packageUOM: z.string().min(1),
      quantityOfEaches: z.number().int().positive(),
      dimensionsHeight: z.number().positive(),
      dimensionsWidth: z.number().positive(),
      dimensionsLength: z.number().positive(),
      packageWeight: z.number().positive(),
      weightUOM: z.string().min(1),
      maintenanceType: z.string().min(1),
    })
    .optional(),

  // Digital assets (images, documents, etc.)
  digitalAssets: z
    .array(
      z.object({
        fileName: z.string().min(1),
        assetType: z.string().min(1),
        fileType: z.string().min(1),
        uri: z.string().min(1),
        country: z.string().min(1),
        maintenanceType: z.string().min(1),
      }),
    )
    .optional(),

  // Part type details
  partType: z
    .object({
      partTypeID: z.number().int().positive(),
      partTypeName: z.string().min(1),
      partTypeDescription: z.string().min(1),
      category: z.string().min(1),
      subcategory: z.string().min(1),
    })
    .optional(),
});

export type ProductSchemaType = z.infer<typeof ProductSchema>;
export class ProductSchemaDTO extends createZodDto(ProductSchema) {}
