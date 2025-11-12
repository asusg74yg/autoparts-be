import { Module } from '@nestjs/common';
import { AcespiesService } from './acespies.service';
import { AcespiesController } from './acespies.controller';
import { DatabaseModule } from 'src/database/database.module';
import { RabbitMqModule } from 'src/rabbit-mq/rabbit-mq.module';

@Module({
  imports: [DatabaseModule, RabbitMqModule],
  providers: [AcespiesService],
  controllers: [AcespiesController],
})
export class AcespiesModule {}
