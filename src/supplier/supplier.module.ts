import { Module } from '@nestjs/common';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';
import { RabbitMqModule } from 'src/rabbit-mq/rabbit-mq.module';

@Module({
  imports: [DatabaseModule, UserModule, RabbitMqModule],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
