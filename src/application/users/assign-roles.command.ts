export class AssignRolesCommand {
  constructor(
    public readonly userId: number,
    public readonly roleIds: number[],
    public readonly currentUserId?: number,
  ) {}
}
