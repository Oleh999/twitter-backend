import { BaseMiddleware } from 'inversify-express-utils';
import { injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';

import { Principal } from '../models/principal.model';
import { AuthService } from '../services/auth.service';
import { FORBIDDEN } from 'http-status-codes';
import { UsersService } from '../../users/services/users.service';

@injectable()
export class ActivatedUserMiddleware extends BaseMiddleware {

    constructor(
        private _authService: AuthService,
        private _usersService: UsersService
    ) {
        super();
    }

    public async handler(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const principal: Principal = this.httpContext.user;
        if (principal.details.active) {
            next();
        } else {
            res.status(FORBIDDEN).json({
                status: 'failed',
                message: 'Account not activated'
            });
        }
    }
}
