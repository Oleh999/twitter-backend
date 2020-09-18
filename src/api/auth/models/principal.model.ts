import { interfaces } from 'inversify-express-utils';
import { Types } from 'mongoose';

import { User } from '../../users/models/user.model';
import { RolesEnum } from '../../users/enums/users.enum';

export class Principal implements interfaces.Principal {
    public details: User;

    public constructor(user: User) {
        this.details = user;
    }

    public async isAuthenticated(): Promise<boolean> {
        return !!this.details;
    }

    public async isResourceOwner(resourceId: Types.ObjectId): Promise<boolean> {
        return this.details._id.equals(resourceId);
    }

    public async isInRole(role: RolesEnum): Promise<boolean> {
        return this.details.roles.includes(role);
    }
}
