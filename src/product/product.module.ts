import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { DatabaseModule } from 'src/database/database.module';
import { ProductController } from './product.controller';
import { UserModule } from 'src/user/user.module';
import { RabbitMqModule } from 'src/rabbit-mq/rabbit-mq.module';

@Module({
  imports: [DatabaseModule, UserModule, RabbitMqModule],
  exports: [ProductService],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
