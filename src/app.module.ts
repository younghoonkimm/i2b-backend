import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as Joi from "joi";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdminModule } from "./admin/admin.module";
import { InfoModule } from "./info/info.module";
import { CommonModule } from "./common/common.module";
import { InfoEntity } from "./common/entities/info.entity";
import { ClientInfoEntity } from "./info/entities/client-info.entity";
import { BaseInfoEntity } from "./info/entities/base-info.entity";
import { DetailInfo } from "./info/entities/detail-info.entity";
import { JWTMiddlewares } from "./jwt/jwt.middlewares";
import { JwtModule } from "./jwt/jwt.module";
import { MailModule } from "./mail/mail.module";
import { AdminInfoEntity } from "./admin/entities/admin-info.entity";
import { ManageMentModule } from "./management/management.module";
import { ManageMentCategoryEntity } from "./management/entities/category.entity";
import { AuthMoudle } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.prod",
      ignoreEnvFile: process.env.NODE_ENV === "prod",
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid("dev", "prod"),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        InfoEntity,
        ClientInfoEntity,
        BaseInfoEntity,
        DetailInfo,
        AdminInfoEntity,
        ManageMentCategoryEntity,
      ],
      synchronize: process.env.NODE_ENV !== "prod",
      logging: process.env.NODE_ENV !== "prod",
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY,
    }),
    MailModule.forRoot({
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
      host: process.env.MAIL_HOST,
    }),
    AuthMoudle.forRoot(),
    AdminModule,
    InfoModule,
    CommonModule,
    ManageMentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JWTMiddlewares).forRoutes({
      path: "/info",
      method: RequestMethod.POST,
    });
  }
}
