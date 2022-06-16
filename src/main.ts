import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import * as requestIp from 'request-ip';
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api');
  app.use(cookieParser());
  var whitelist = [
    'http://localhost:3000',
    'https://staking-admin-panel.netlify.app',
    'https://ico-landing.netlify.app',
    'https://ico-admin-panel.netlify.app',
  ];
  app.enableCors({
    credentials: true, //access-control-allow-credentials:true
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS ${origin}`));
      }
    },
  });

  // app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      // transform: true,
      // whitelist: true,
      // forbidNonWhitelisted: true,
    }),
  );
  // app.use(requestIp.mw());

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
