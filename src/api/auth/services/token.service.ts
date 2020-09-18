import { injectable } from 'inversify';
import { uuid } from 'uuidv4';

import { TokenRepository } from '../repositories/token.repository';
import { DocumentToken, Token } from '../models/token.model';
import { TokenType } from '../enums/token.enum';
import { Types } from 'mongoose';

@injectable()
export class TokenService {
    constructor(
        private _tokenRepository: TokenRepository) {
    }

    public async findTokenByBodyAndType(
        body: string,
        type: TokenType
    ): Promise<DocumentToken> {
        return this._tokenRepository.findByBodyAndType(body, type);
    }

    public async createConfirmPasswordToken(
        userId: Types.ObjectId
    ): Promise<DocumentToken> {
        return this._tokenRepository.createToken(
            new Token({
                userId,
                tokenBody: uuid(),
                tokenType: TokenType.ConfirmEmail,
                createdAt: Date.now(),
            })
        );
    }

    public async deleteToken(
        tokenId: Types.ObjectId
    ): Promise<DocumentToken> {
        return this._tokenRepository.deleteToken(tokenId);
    }

    public async deleteTokenByUserId(
        userId: Types.ObjectId
    ): Promise<DocumentToken> {
        return this._tokenRepository.deleteTokenByUserId(userId);
    }
}
