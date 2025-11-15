import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from 'common/interceptor/http-exception.interceptor';
import { ResponseInterceptor } from 'common/interceptor/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { LogInterceptor } from 'common/interceptor/log.interceptor';
import { AuthGuard } from 'common/guard/auth.guard';
import { RolesGuard } from 'common/guard/role.guard';
import { BigIntSerealizer } from 'common/config/BigIntSerealizer.config';
import { AcespiesModule } from './acespies/acespies.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //config: BigIntSerealizer
  BigIntSerealizer();
  //config: CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  if (process.env.NODE_ENV === 'production') app.enableCors();

  //config: application specific
  app.useGlobalGuards(app.get(AuthGuard), app.get(RolesGuard));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    app.get(ResponseInterceptor),
    app.get(LogInterceptor),
  );

  const config = new DocumentBuilder()
    .setTitle('AutoParts - Api Documentation')
    .setDescription('')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  //config: RabbitMQ Microservices
  const logQueue = await NestFactory.createMicroservice<MicroserviceOptions>(
    ActivityLogModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${process.env.RABBIT_MQ}`],
        queue: 'append_only_log',
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  await logQueue.listen();

  const acesPiesQueue =
    await NestFactory.createMicroservice<MicroserviceOptions>(AcespiesModule, {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${process.env.RABBIT_MQ}`],
        queue: 'aces_pies_queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  await acesPiesQueue.listen();

  // App Listen @ PORT 3000 | PORT
  console.log('hhello', process.env.PORT);
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
