import { ContainerModule, interfaces } from 'inversify';
import { DatabaseConnection } from './database-connection';

export const DatabaseModule = new ContainerModule((bind: interfaces.Bind) => {
    bind(DatabaseConnection).toConstantValue(DatabaseConnection.createConnection());
});
