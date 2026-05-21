import { Name } from '../value-objects/name.value-object';
import { Percentage } from '../value-objects/percentage.value-object';

export class Tax {
  id: number = 0;
  private _name: Name;
  private _currentRate: Percentage;

  constructor(name: string, rate: number) {
    this._name = new Name(name);
    this._currentRate = new Percentage(rate);
  }

  get name(): string {
    return this._name.getValue();
  }

  get currentRate(): number {
    return this._currentRate.getValue();
  }

  updateRate(rate: number): void {
    this._currentRate = new Percentage(rate);
  }
}
