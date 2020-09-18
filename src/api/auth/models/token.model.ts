import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { DocumentType, prop, Ref } from '@typegoose/typegoose';
import { CreateQuery } from 'mongoose';
import { User } from '../../users/models/user.model';
import { ApiModel, ApiModelProperty } from 'swagger-express-typescript';
import { TokenType } from '../enums/token.enum';

@ApiModel({
    description: 'Model of token',
    name: 'Token',
})
export class Token extends Base {
    @ApiModelProperty({
        description: 'Token User',
        required: true,
        example: ['5f423af74c9234267e6aa6ea'],
    })
    @prop({ ref: () => User, required: true })
    public userId: Ref<User>;

    @ApiModelProperty({
        description: 'Token body',
        required: true,
        example: ['550e8400-e29b-41d4-a716-446655440000'],
    })
    @prop({ required: true })
    public tokenBody: string;

    @ApiModelProperty({
        description:
            'Token type: 0 = \'ConfirmEmail\', 1 = \'ResetPassword\', 2 =\'ChangeEmail\' ',
        required: true,
        enum: ['0', '1', '2'],
        example: ['0', '1', '2'],
    })
    @prop({ required: true })
    public tokenType: TokenType;

    @ApiModelProperty({
        description: 'Token time stamp',
        required: true,
        example: ['20200801'],
    })
    @prop({ required: false, default: Date.now() })
    public createdAt: number;

    @ApiModelProperty({
        description: 'Token lifetime',
        required: true,
        example: ['20223450'],
    })
    @prop({ required: false, default: 1000 * 60 * 5 })
    private lifetime: number;

    public get isExpired(): boolean {
        return Date.now() - this.createdAt > this.lifetime;
    }

    constructor(token: CreateQuery<Token>) {
        super();
        Object.assign(this, token);
    }
}

export type DocumentToken = DocumentType<Token>;
