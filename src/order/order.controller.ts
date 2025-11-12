import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  // Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  OrderSchema,
  OrderSchemaDTO,
  OrderSchemaType,
} from './dto/create-order.dto';
import { OrderStatusSchema } from './dto/update-order.dto';
import { ZodValidationPipe } from 'common/validator/zod.validator';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { Roles } from 'common/decorator/roles.decorator';
import { Public } from 'common/decorator/public.decorator';

@Roles(['ADMIN', 'STAFF'])
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Get()
  findAll() {
    return this.orderService.findAll();
  }
  @Public()
  @Get('/success')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Session Token',
    required: true,
  })
  paymentSucess(@Query('id') id: string) {
    return this.orderService.confirmOrder(id);
  }
  @Public()
  @Get('/email/:email')
  @ApiParam({
    name: 'email',
    type: String,
    description: 'Email',
    required: true,
  })
  getOrdersByEmail(@Param('email') email: string) {
    return this.orderService.getOrdersByEmail(email);
  }

  @Public()
  @Get('/orderNumber/:orderNumber')
  @ApiParam({
    name: 'orderNumber',
    type: String,
    description: 'Order Number',
    required: true,
  })
  getOrderByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.orderService.getOrderByOrderNumber(orderNumber);
  }

  @Get('/get-kpis')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Order Id',
    required: true,
  })
  getKpis() {
    return this.orderService.getKpis();
  }

  @Get('/status/:status')
  @ApiParam({
    name: 'status',
    type: String,
    description: 'Order Status',
    required: true,
  })
  getOrdersByStatus(@Param('status') status: string) {
    return this.orderService.getOrderByStatus(status);
  }

  @Public()
  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Order Id',
    required: true,
  })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Roles(['ADMIN', 'STAFF', 'USER'])
  @Get('/t-no/:trackingNumber')
  @ApiParam({
    name: 'trackingNumber',
    type: String,
    description: 'tracking number',
    required: true,
  })
  getOrderByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.orderService.getOrderByTrackingNumber(trackingNumber);
  }

  @Public()
  @Post()
  @ApiBody({ type: () => OrderSchemaDTO })
  create(
    @Body(new ZodValidationPipe(OrderSchema)) body: OrderSchemaType,
    // @Req() req: Request,
  ) {
    // const { id } = (req as any).user;

    return this.orderService.create(body);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Order Id',
    required: true,
  })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(OrderStatusSchema))
    body,
  ) {
    return this.orderService.update(id, body);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Order Id',
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.orderService.delete(id);
  }
}
