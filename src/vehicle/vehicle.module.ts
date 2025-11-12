import { Module } from '@nestjs/common';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { DatabaseModule } from 'src/database/database.module';
import { APP_GUARD } from '@nestjs/core/constants';
import { AuthGuard } from 'common/guard/auth.guard';
import { RabbitMqModule } from 'src/rabbit-mq/rabbit-mq.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [DatabaseModule, RabbitMqModule, UserModule],
  controllers: [VehicleController],
  providers: [
    VehicleService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class VehicleModule {}
