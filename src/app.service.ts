import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getName() {
    return {
      name: 'ticket-booking-system'
    };
  }
}
