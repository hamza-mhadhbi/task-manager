import { Catch, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class UserAlreadyExistsException extends HttpException {
  message: string = 'The email is already exists !';

  constructor() {
    super('The email is already exists !', HttpStatus.CONFLICT);
  }
}
