import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { createVehicleDto, VehicleDTO } from './dto/createVehicle.dto';
import { UpdateVehicleDTO, updateVehicleDto } from './dto/updateVehicle.dto';
import { ZodValidationPipe } from 'common/validator/zod.validator';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { logSchema } from 'common/validator/logSchema.validator';
import { LogAction } from 'common/decorator/action.decorator';
import { Roles } from 'common/decorator/roles.decorator';
import { RolesGuard } from 'common/guard/role.guard';

@Roles(['ADMIN', 'STAFF'])
@UseGuards(RolesGuard)
@Controller('vehicle')
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Get(':id')
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  findAll(@Param('id') id: string) {
    return this.vehicleService.findAll(id);
  }

  @LogAction(logSchema('create-action', 'vehicle'))
  @Post('/create')
  @ApiBody({ type: () => VehicleDTO })
  create(
    @Body(new ZodValidationPipe(createVehicleDto)) body,
    @Req() request: any,
  ) {
    const user = request.user;
    return this.vehicleService.create(user, body);
  }

  @LogAction(logSchema('update-action', 'vehicle'))
  @Patch(':id')
  @ApiBody({ type: () => UpdateVehicleDTO })
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: String })
  update(
    @Param('id', ParseUUIDPipe) id,
    @Body(new ZodValidationPipe(updateVehicleDto)) body,
  ) {
    return this.vehicleService.update(id, body);
  }

  @LogAction(logSchema('delete-action', 'vehicle'))
  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Vehicle ID', type: String })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehicleService.remove(id);
  }
}
