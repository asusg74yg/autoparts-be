import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMqService } from './rabbit-mq.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'LOG_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://${process.env.RABBIT_MQ}`],
          queue: 'append_only_log',
          queueOptions: { durable: true },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'ACES_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://${process.env.RABBIT_MQ}`],
          queue: 'aces_pies_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
  providers: [RabbitMqService],
})
export class RabbitMqModule {}
