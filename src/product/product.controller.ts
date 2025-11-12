import {
  Controller,
  //   Patch,
  Get,
  //   Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  //   Query,
  //   UseInterceptors,
  //   UploadedFile,
} from '@nestjs/common';
import { ProductService } from './product.service';
// import { ZodValidationPipe } from 'common/validator/zod.validator';
// import { ProductSchema, ProductSchemaDTO } from './dto/create-product.dto';
// import {
//   UpdateProductSchema,
//   UpdateProductSchemaDTO,
// } from './dto/update-product.dto';
import { Roles } from 'common/decorator/roles.decorator';
import {
  // ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from 'common/guard/role.guard';
import { logSchema } from 'common/validator/logSchema.validator';
import { LogAction } from 'common/decorator/action.decorator';
import { Public } from 'common/decorator/public.decorator';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { multerConfig } from './config/multer.config';

@Roles(['ADMIN', 'STAFF'])
@UseGuards(RolesGuard)
@Controller('product')
export class ProductController {
  constructor(private productServer: ProductService) {}

  @Get()
  async findAll() {
    return await this.productServer.findAll();
  }

  @Public()
  @Get('getAllList')
  async findAllLists() {
    return await this.productServer.findAllLists();
  }

  //   @LogAction(logSchema('create-action', 'product'))
  //   @Post()
  //   @UseInterceptors(FileInterceptor('image', multerConfig))
  //   @ApiBody({
  //     type: () => ProductSchemaDTO,
  //   })
  //   async create(
  //     @UploadedFile() image: Express.Multer.File,
  //     @Body(new ZodValidationPipe(ProductSchema)) data,
  //   ) {
  //     data.imageURL = image.path.replaceAll('\\', '/');
  //     return await this.productServer.create(data);
  //   }
  @Public()
  @Get('make')
  async getAllMakes() {
    return this.productServer.getAllMakes();
  }
  @Public()
  @Get('year/:make')
  async getYearsByMake(@Param('make') make: string) {
    return this.productServer.getYearsByMake(make);
  }
  @Public()
  @Get('model/:make/:year')
  async getModelsByMakeAndYear(
    @Param('make') make: string,
    @Param('year') year: number,
  ) {
    return this.productServer.getModelsByMakeAndYear(make, Number(year));
  }

  @Public()
  @Get('category')
  async getCategoriesByModel(
    @Query('make') make: string,
    @Query('model') model: string,
    @Query('year') year: number,
  ) {
    return this.productServer.getCategoriesByMakeYearModel(
      make,
      Number(year),
      model,
    );
  }
  @Public()
  @Get('/findProduct')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'The ID of the product',
  })
  async findProduct(
    @Query('partNumber') partNumber: string,
    @Query('partName') partName: string,
  ) {
    return await this.productServer.findProduct(partNumber, partName);
  }
  @Public()
  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'The ID of the product',
  })
  async findOne(@Param('id') id: string) {
    return await this.productServer.findOne(id);
  }

  //   @LogAction(logSchema('update-action', 'product'))
  //   @Patch(':id')
  //   @UseInterceptors(FileInterceptor('image', multerConfig))
  //   @ApiParam({
  //     name: 'id',
  //     type: String,
  //     required: true,
  //     description: 'The ID of the product',
  //   })
  //   @ApiBody({
  //     type: () => UpdateProductSchemaDTO,
  //   })
  //   async update(
  //     @Param('id') id: string,
  //     @UploadedFile() image: Express.Multer.File,
  //     @Body(new ZodValidationPipe(UpdateProductSchema)) data,
  //   ) {
  //     data.imageURL = image.path.replaceAll('\\', '/');
  //     return await this.productServer.update(id, data);
  //   }
  @LogAction(logSchema('delete-action', 'product'))
  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description: 'The ID of the product',
  })
  async delete(@Param('id') id: string) {
    return await this.productServer.delete(id);
  }
}
