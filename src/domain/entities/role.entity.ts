import { UserRole } from '../enums/user-role.enum';

export class Role {
  id: number = 0;
  name: UserRole;
  description: string | null = null;

  constructor(name: UserRole, description?: string) {
    this.name = name;
    this.description = description ?? null;
  }
}
