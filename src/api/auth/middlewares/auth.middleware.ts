import { BaseMiddleware } from 'inversify-express-utils';
import { injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';

import { Principal } from '../models/principal.model';
import { AuthService } from '../services/auth.service';
import { UNAUTHORIZED } from 'http-status-codes';

@injectable()
export class AuthMiddleware extends BaseMiddleware {

    constructor(
        private _authService: AuthService
    ) {
        super();
    }

    public async handler(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const principal: Principal = this.httpContext.user;
        if (await principal.isAuthenticated()) {
            next();
        } else {
            res.status(UNAUTHORIZED).json({
                status: 'failed',
                message: 'Unauthorized'
            });
        }
    }
}
