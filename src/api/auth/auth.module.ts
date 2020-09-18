import { ContainerModule, interfaces } from 'inversify';

import { AuthService } from './services/auth.service';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { AuthController } from './controllers/auth.controller';
import { MailService } from './services/mail.service';
import { TokenService } from './services/token.service';
import { TokenRepository } from './repositories/token.repository';
import { ActivatedUserMiddleware } from './middlewares/activated.user.middleware';

export const AuthModule = new ContainerModule((bind: interfaces.Bind) => {
    bind(AuthMiddleware).to(AuthMiddleware);
    bind(ActivatedUserMiddleware).to(ActivatedUserMiddleware);
    bind(AuthService).to(AuthService);
    bind(MailService).to(MailService);
    bind(AuthController).to(AuthController);
    bind(TokenService).to(TokenService);
    bind(TokenRepository).to(TokenRepository);
});
