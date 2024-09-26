import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserEntity } from '../../users/schema/user.entity';
import { TicketsService } from '../tickets.service';
import { Request } from 'express';


@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly ticketsService: TicketsService
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserEntity;
    const req = request as Request;
    let isOwner: boolean = false;
    if (req.params.id) {
      const { ticket } = await this.ticketsService.getTicket({id: req.params.id}, user.id);
      isOwner = ticket.userId == user.id;
    }
    if (req.query.userId) {
      isOwner = req.query.userId == user.id;
    }
    if (user.role != 'admin' && isOwner == false) {
      return false;
    }
    return true;
  }
}