import { Reflector } from '@nestjs/core';
import { Role } from '../users/schema/role.type';

export const Roles = Reflector.createDecorator<Role[]>();