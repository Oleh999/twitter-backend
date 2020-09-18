import { ApiModel, ApiModelProperty, } from 'swagger-express-typescript';
import { DocumentUser } from '../../users/models/user.model';


@ApiModel({
    description: 'Model of auth response',
    name: 'UserWithToken'
})
export class UserWithToken {
    @ApiModelProperty({
        model: 'User'
    })
    public user: DocumentUser;

    @ApiModelProperty({
        example: ['i5XWdOI4bkiXz49dc.NmzyDyJJiMyz3kqEIX4hz1Nrd19NjOXOOUuTU4gpne4CcsTMIkiMVWT_IZ1IEJtNiNhU0iY1cZYkmMU6Yp3-1DBETj1ULI5iDQXRm6JjcIk2NQM6iBp.CVCjZSNOOCdQ2ODGIvcCHsTVJyt0IzN2eFI4MeU_5O'],
    })
    public token: string;

    constructor(
        user: DocumentUser,
        token: string)
    {
        this.user = user;
        this.token = token;
    }
}
