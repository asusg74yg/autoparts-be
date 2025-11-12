import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { SupportService } from './support.service';
import {
  CreateSupportSchema,
  CreateSupportSchemaDTO,
} from './dto/create-support.dto';
import { Request } from 'express';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import {
  UpdateSupportSchema,
  UpdateSupportSchemaDTO,
} from './dto/update-support.dto';
import { ZodValidationPipe } from 'common/validator/zod.validator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';
import { Roles } from 'common/decorator/roles.decorator';

@Roles(['ADMIN', 'STAFF'])
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  findAll() {
    return this.supportService.findAll();
  }

  @Roles(['ADMIN', 'STAFF', 'USER'])
  @Get('/user')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Support Ticket Id',
    required: true,
  })
  getAllByUserId(@Req() req: Request) {
    const { id } = (req as any).user;
    return this.supportService.getAllByUserId(id);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Support Ticket Id',
    required: true,
  })
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 4, multerConfig))
  @ApiBody({ type: () => CreateSupportSchemaDTO })
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body(new ZodValidationPipe(CreateSupportSchema))
    body,
    @Req() req: Request,
  ) {
    const { id } = (req as any).user;
    const filesUrl = files.map((file) => file.path.replaceAll('\\', '/'));
    return this.supportService.create(id, body, filesUrl);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String, description: 'Support Ticket Id' })
  @ApiBody({ type: () => UpdateSupportSchemaDTO })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateSupportSchema)) updateSupportDto,
  ) {
    return this.supportService.update(id, updateSupportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supportService.remove(id);
  }
}
