import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

@Entity({ name: 'e_users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @CreateDateColumn()
  created_at: Date;
}