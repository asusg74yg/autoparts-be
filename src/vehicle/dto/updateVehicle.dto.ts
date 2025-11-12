import { createZodDto } from '@anatine/zod-nestjs';
import { createVehicleDto } from 'src/vehicle/dto/createVehicle.dto';

export const updateVehicleDto = createVehicleDto.partial();
export class UpdateVehicleDTO extends createZodDto(updateVehicleDto) {}
