import {
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { ZodValidationPipe } from 'common/validator/zod.validator';
import { SupplierSchema, SupplierSchemaDTO } from './dto/create-supplier.dto';
import {
  UpdateSupplier,
  UpdateSupplierSchemaDTO,
} from './dto/update-supplier.dto';
import { Roles } from 'common/decorator/roles.decorator';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { RolesGuard } from 'common/guard/role.guard';
import { LogAction } from 'common/decorator/action.decorator';
import { logSchema } from 'common/validator/logSchema.validator';

@Roles(['ADMIN', 'STAFF'])
@UseGuards(RolesGuard)
@Controller('supplier')
export class SupplierController {
  constructor(private supplierService: SupplierService) {}

  @Get('/')
  findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @LogAction(logSchema('create-action', 'supplier'))
  @Post()
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @ApiBody({
    type: () => SupplierSchemaDTO,
  })
  create(@Body(new ZodValidationPipe(SupplierSchema)) body) {
    return this.supplierService.create(body);
  }

  @LogAction(logSchema('update-action', 'supplier'))
  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @ApiBody({
    type: () => UpdateSupplierSchemaDTO,
  })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateSupplier)) body,
  ) {
    return this.supplierService.update(id, body);
  }

  @LogAction(logSchema('delete-action', 'supplier'))
  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  delete(@Param('id') id: string) {
    return this.supplierService.delete(id);
  }
}
