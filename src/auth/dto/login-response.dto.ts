import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginResponseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}
