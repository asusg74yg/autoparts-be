import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'common/decorator/roles.decorator';
import { CmsService } from './cms.service';
import { RolesGuard } from 'common/guard/role.guard';
import { CmsSchema, CmsSchemaDTO } from './dto/create-cms.dto';
import { ZodValidationPipe } from 'common/validator/zod.validator';
import { UpdateCmsSchema } from './dto/update-cms.dto';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { logSchema } from 'common/validator/logSchema.validator';
import { LogAction } from 'common/decorator/action.decorator';
import { Public } from 'common/decorator/public.decorator';

@Roles(['ADMIN', 'STAFF'])
@UseGuards(RolesGuard)
@Controller('cms')
export class CmsController {
  constructor(private cmsService: CmsService) {}
  @Get()
  async findAll() {
    return await this.cmsService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The ID of the Content',
  })
  async findOne(@Param('id') id: string) {
    return await this.cmsService.findOne(id);
  }
  @Public()
  @Get('findBySlug/:slug')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The ID of the Content',
  })
  async findOneBySlug(@Param('slug') slug: string) {
    return await this.cmsService.findOneBySlug(slug);
  }

  @LogAction(logSchema('create-action', 'email-template'))
  @Post()
  @ApiBody({
    type: () => CmsSchemaDTO,
  })
  async create(@Body(new ZodValidationPipe(CmsSchema)) data) {
    return await this.cmsService.create(data);
  }
  @LogAction(logSchema('update-action', 'email-template'))
  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The ID of the Content',
  })
  @ApiBody({
    type: () => UpdateCmsSchema,
  })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCmsSchema)) data,
  ) {
    return await this.cmsService.update(id, data);
  }

  @LogAction(logSchema('delete-action', 'email-template'))
  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'The ID of the Content',
  })
  async delete(@Param('id') id: string) {
    return await this.cmsService.delete(id);
  }
}
