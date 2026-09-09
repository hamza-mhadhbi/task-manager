import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  User = 'USER',
  Admin = 'ADMIN',
}

@Entity({
  name: 'users',
})
export class User {
  @PrimaryColumn({
    type: 'uuid',
    generated: 'uuid',
  })
  id: string;

  @Column({ type: 'string', nullable: false, unique: true })
  email: string;

  @Column({ type: 'string' })
  fullName: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt?: string;
}
