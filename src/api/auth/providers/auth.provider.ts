import { inject, injectable } from 'inversify';
import { interfaces } from 'inversify-express-utils';
import { Request } from 'express';

import { Principal } from '../models/principal.model';
import { AuthService } from '../services/auth.service';

@injectable()
export class AuthProvider implements interfaces.AuthProvider {

    @inject(AuthService) private _authService: AuthService;

    public async getUser(
        req: Request
    ): Promise<interfaces.Principal> {
        const token: string = req.header('x-auth-token');
        if(!token) {
            return new Principal(null);
        }
        try {
            const user = await this._authService.getUserFromToken(token);
            return new Principal(user);
        } catch(error) {
            return new Principal(null);
        }
    }
}
