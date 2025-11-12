import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { SupplierModule } from './supplier/supplier.module';
import { ProductModule } from './product/product.module';
import { EmailtemplateModule } from './emailtemplate/emailtemplate.module';
import { CmsModule } from './cms/cms.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';
import { ResponseInterceptor } from 'common/interceptor/response.interceptor';
import { LogInterceptor } from 'common/interceptor/log.interceptor';
import { RolesGuard } from 'common/guard/role.guard';
import { AuthGuard } from 'common/guard/auth.guard';
import { OrderModule } from './order/order.module';
import { SupportModule } from './support/support.module';
import { ReviewModule } from './review/review.module';
import { AcespiesModule } from './acespies/acespies.module';
import { PromotionModule } from './promotion/promotion.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    VehicleModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'), // <-- path to the static files
      serveRoot: '/uploads', // URL prefix
      // Avoid serving index.html
      renderPath: '/', // optional; ensures no fallback to index.html
      exclude: ['/api*'], // Don't serve static files for these routes
    }),
    SupplierModule,
    ProductModule,
    EmailtemplateModule,
    CmsModule,
    ActivityLogModule,
    RabbitMqModule,
    OrderModule,
    SupportModule,
    ReviewModule,
    AcespiesModule,
    PromotionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ResponseInterceptor,
    LogInterceptor,
    AuthGuard,
    RolesGuard,
  ],
})
export class AppModule {}
