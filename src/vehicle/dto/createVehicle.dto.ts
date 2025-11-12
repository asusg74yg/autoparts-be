import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const createVehicleDto = z.object({
  brand: z.string().transform((val) => val.toLowerCase().trim()),
  model: z.string().transform((val) => val.toLowerCase().trim()),
  year: z.string().transform((val) => Number(val)),
  make: z.string().min(4),
});

type Vehicle = z.infer<typeof createVehicleDto>;
export class VehicleDTO extends createZodDto(createVehicleDto) {}

export type { Vehicle };
