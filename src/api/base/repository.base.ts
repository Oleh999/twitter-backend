import {
    DocumentType,
    getModelForClass,
    ReturnModelType,
} from '@typegoose/typegoose';
import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { CreateQuery } from 'mongoose';
import { injectable } from 'inversify';

import { DatabaseConnection } from '../../database/database-connection';

type Constructor<U> = new (doc?: CreateQuery<U>) => U;

@injectable()
export abstract class RepositoryBase<T> {
    protected abstract _repository: ReturnModelType<any>;

    public newDocument(doc: CreateQuery<T>): DocumentType<T> {
        return new this._repository(doc);
    }

    public initRepository(
        connection: DatabaseConnection,
        constructor: Constructor<Base>
    ): void {
        this._repository = getModelForClass(constructor, {
            existingConnection: connection,
            schemaOptions: {
                versionKey: false,
            },
        });
    }
}
