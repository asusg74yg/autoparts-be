import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EmailtemplateService } from './emailtemplate.service';
import { ZodValidationPipe } from 'common/validator/zod.validator';
import { EmailSchema, EmailSchemaDTO } from './dto/create-email.dto';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { UpdateEmailSchemaDTO } from './dto/update-email.dto';
import { Roles } from 'common/decorator/roles.decorator';
import { RolesGuard } from 'common/guard/role.guard';
import { logSchema } from 'common/validator/logSchema.validator';
import { LogAction } from 'common/decorator/action.decorator';

@Roles(['ADMIN', 'STAFF'])
@UseGuards(RolesGuard)
@Controller('emailtemplate')
export class EmailtemplateController {
  constructor(private readonly emailTemplateService: EmailtemplateService) {}

  @Get()
  findAll() {
    return this.emailTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailTemplateService.findOne(id);
  }

  @LogAction(logSchema('create-action', 'email-template'))
  @Post()
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @ApiBody({
    type: () => EmailSchemaDTO,
  })
  create(@Body(new ZodValidationPipe(EmailSchema)) body) {
    return this.emailTemplateService.create(body);
  }
  @LogAction(logSchema('update-action', 'email-template'))
  @Patch(':id')
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
  })
  @ApiBody({
    type: () => UpdateEmailSchemaDTO,
  })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(EmailSchema)) body,
  ) {
    return this.emailTemplateService.update(id, body);
  }

  @LogAction(logSchema('delete-action', 'email-template'))
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.emailTemplateService.delete(id);
  }
}
