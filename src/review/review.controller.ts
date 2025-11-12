import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Req,
  Patch,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ZodValidationPipe } from 'common/validator/zod.validator';
import { ReviewSchema, ReviewSchemaDTO } from './dto/create-review.dto';
import { Roles } from 'common/decorator/roles.decorator';
import {
  UpdateReviewSchema,
  UpdateReviewSchemaDTO,
} from './dto/update-review.dto';
import { ApiBody, ApiParam } from '@nestjs/swagger';

@Roles(['ADMIN', 'STAFF'])
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Review Id',
    required: true,
  })
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Roles(['USER', 'ADMIN', 'STAFF'])
  @Post()
  @ApiBody({ type: () => ReviewSchemaDTO })
  create(@Req() req: Request, @Body(new ZodValidationPipe(ReviewSchema)) body) {
    const { id } = (req as any).user;
    return this.reviewService.create(id, body);
  }

  @Roles(['USER', 'ADMIN', 'STAFF'])
  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Review Id',
    required: true,
  })
  @ApiBody({ type: () => UpdateReviewSchemaDTO })
  update(
    @Param('id') reviewId: string,
    @Req() req: Request,
    @Body(new ZodValidationPipe(UpdateReviewSchema)) body,
  ) {
    const { id } = (req as any).user;
    body.userId = id;
    return this.reviewService.update(reviewId, body);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Review Id',
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.reviewService.delete(id);
  }
}
