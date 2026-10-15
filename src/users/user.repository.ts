import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity.js';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  public async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  public async findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  public async create(user: Partial<User>): Promise<User> {
    return this.repository.save(this.repository.create(user));
  }
}
