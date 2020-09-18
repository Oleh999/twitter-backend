import 'reflect-metadata';
import * as dotenv from 'dotenv';

if (!process.env.IS_PRODUCTION) {
    dotenv.config({
        path: '.env.dev'
    });
}

import { App } from './app';
import { AppModule } from './app.module';
import { InversifyExpressServer } from 'inversify-express-utils';
import { AuthProvider } from './api/auth/providers/auth.provider';

const app: App = AppModule.get(App),
    server: InversifyExpressServer = new InversifyExpressServer(
        AppModule,
        null,
        { rootPath: '/api/v1' },
        app.app,
        AuthProvider
    );

server
    .build()
    .listen(app.port, (err) => {
        if (err) {
            return console.log(err.message);
        }
        console.log(`Server started on port ${app.port}`);
    });
