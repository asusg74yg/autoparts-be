import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { RolesGuard } from 'common/guard/role.guard';
import { Roles } from 'common/decorator/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { ProductSchemaDTO, promotionSchema } from './dto/promotion.dto';
import { ZodValidationPipe } from '../../common/validator/zod.validator';
import { Public } from 'common/decorator/public.decorator';

@Roles(['ADMIN', 'STAFF'])
@UseGuards(RolesGuard)
@Controller('promotion')
export class PromotionController {
  constructor(private promotionService: PromotionService) {}

  @Roles(['ADMIN', 'STAFF', 'USER'])
  @Public()
  @Get()
  findAll() {
    return this.promotionService.findAll();
  }

  @Roles(['ADMIN', 'STAFF', 'USER'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiBody({
    type: () => ProductSchemaDTO,
  })
  @Post()
  create(
    @UploadedFile() image: Express.Multer.File,
    @Body(new ZodValidationPipe(promotionSchema)) body,
  ) {
    body.imageUrl = image.path.replaceAll('\\', '/');

    return this.promotionService.create(body);
  }

  @UseInterceptors(FileInterceptor('image', multerConfig))
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'The ID of the Promotion',
  })
  @ApiBody({
    type: () => ProductSchemaDTO,
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    // @UploadedFile() image: Express.Multer.File,
    @Body(new ZodValidationPipe(promotionSchema)) body,
  ) {
    // body.imageURL = image.path.replaceAll('\\', '/');
    return this.promotionService.update(id, body);
  }

  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'The ID of the Promotion',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionService.delete(id);
  }
}
