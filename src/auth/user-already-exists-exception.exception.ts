import { Catch, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super('The email is already exists !', HttpStatus.CONFLICT);
  }
}
