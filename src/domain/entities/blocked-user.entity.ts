export class BlockedUser {
  id: number = 0;
  userId: number;
  failedAttempts: number = 0;
  blockedAt: Date | null = null;

  constructor(userId: number) {
    this.userId = userId;
  }

  incrementFailedAttempts(): void {
    this.failedAttempts++;
    if (this.failedAttempts >= 3) {
      this.block();
    }
  }

  block(): void {
    this.blockedAt = new Date();
  }

  isBlocked(): boolean {
    return this.blockedAt !== null;
  }

  reset(): void {
    this.failedAttempts = 0;
    this.blockedAt = null;
  }
}