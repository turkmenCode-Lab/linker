import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DataBaseModule } from './configs/db.config';
import { ProxyController } from './proxy/proxy.controller';
import { ProxyService } from './proxy/providers/proxy.service';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().required(),
        MONGODB_URI: Joi.string().default('mongodb://localhost/app'),
      }),
    }),
    DataBaseModule,
    AuthModule,
    ProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
