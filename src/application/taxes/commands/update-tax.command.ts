import { Tax } from '../../../domain/entities/tax.entity';

export class UpdateTaxCommand {
  constructor(
    public readonly id: number,
    public readonly taxData: Partial<Tax>,
  ) {}
}
