import { injectable } from 'inversify';
import { ReturnModelType } from '@typegoose/typegoose';
import { CreateQuery, Types } from 'mongoose';

import { DatabaseConnection } from '../../../database/database-connection';
import { DocumentToken, Token } from '../models/token.model';
import { RepositoryBase } from '../../base/repository.base';
import { TokenType } from '../enums/token.enum';

@injectable()
export class TokenRepository extends RepositoryBase<Token> {
    protected _repository: ReturnModelType<typeof Token>;

    constructor(private _databaseConnection: DatabaseConnection) {
        super();
        this.initRepository(this._databaseConnection, Token);
    }

    public async findByBodyAndType(
        body: string,
        type: TokenType
    ): Promise<DocumentToken> {
        return this._repository.findOne({
            $and: [{ tokenBody: body }, { tokenType: type }],
        });
    }

    public async createToken(
        token: CreateQuery<Token>
    ): Promise<DocumentToken> {
        return this._repository.create(token);
    }

    public async deleteToken(tokenId: Types.ObjectId): Promise<DocumentToken> {
        return this._repository.findByIdAndDelete(tokenId);
    }

    public async deleteTokenByUserId(userId: Types.ObjectId): Promise<DocumentToken> {
        return this._repository.findOneAndDelete({ userId: userId});
    }
}
