import { Module } from '@nestjs/common';
import { EmailtemplateController } from './emailtemplate.controller';
import { EmailtemplateService } from './emailtemplate.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from 'src/user/user.module';
import { RabbitMqModule } from 'src/rabbit-mq/rabbit-mq.module';

@Module({
  imports: [DatabaseModule, UserModule, RabbitMqModule],
  controllers: [EmailtemplateController],
  providers: [EmailtemplateService],
})
export class EmailtemplateModule {}
