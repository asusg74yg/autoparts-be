import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';
import { RabbitMqModule } from 'src/rabbit-mq/rabbit-mq.module';

@Module({
  imports: [DatabaseModule, UserModule, RabbitMqModule],
  controllers: [CmsController],
  providers: [CmsService],
})
export class CmsModule {}
