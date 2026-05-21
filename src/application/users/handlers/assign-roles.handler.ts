import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRolesCommand } from '../commands/assign-roles.command';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IRoleRepository } from '../../../domain/repositories/role.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';

@CommandHandler(AssignRolesCommand)
export class AssignRolesHandler implements ICommandHandler<AssignRolesCommand> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: AssignRolesCommand): Promise<User> {
    const { userId, roleIds, currentUserId } = command;

    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate roles exist
    const roles = await this.roleRepository.findByIds(roleIds);
    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid');
    }

    // Check if trying to remove own admin role
    const adminRole = roles.find((r) => r.name === UserRole.ADMINISTRATOR);
    const hasAdminRole = user.roles.some((r) => r === UserRole.ADMINISTRATOR);
    if (
      currentUserId === userId &&
      hasAdminRole &&
      adminRole &&
      !roleIds.includes(adminRole.id)
    ) {
      throw new BadRequestException(
        'Cannot remove your own administrator role',
      );
    }

    // Update user roles
    return this.userRepository.updateRoles(userId, roleIds);
  }
}
