import * as express from 'express';
import * as cors from 'cors';
import { injectable } from 'inversify';
import * as swagger from 'swagger-express-typescript';
import { SwaggerDefinitionConstant } from 'swagger-express-typescript';

@injectable()
export class App {
  public get app(): express.Express {
    return this._app;
  }

  public get port(): number {
    return this._port;
  }

  private readonly _app: express.Express;
  private readonly _port = Number.parseInt(process.env.PORT);

  constructor() {
    this._app = express();
    this._app.use(express.urlencoded({ extended: true }));
    this._app.use(express.json());
    this._app.use(cors());
    this._app.use('/api-docs/swagger', express.static('swagger'));
    this._app.use(
      '/api-docs/swagger/assets',
      express.static('node_modules/swagger-ui-dist')
    );
    this._app.use(
      swagger.express({
        definition: {
          info: {
            title: 'Twitter API',
            version: '1.0',
          },
          securityDefinitions: {
            apiKeyHeader: {
              type: SwaggerDefinitionConstant.Security.Type.API_KEY,
              in: SwaggerDefinitionConstant.Security.In.HEADER,
              name: 'x-auth-token',
            },
          },
        },
      })
    );
  }
}
