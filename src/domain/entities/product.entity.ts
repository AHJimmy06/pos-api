import { Name } from '../value-objects/name.value-object';
import { Price } from '../value-objects/price.value-object';
import { Stock } from '../value-objects/stock.value-object';

export class Product {
  id: number = 0;
  private _name: Name;
  private _price: Price;
  private _stock: Stock;

  constructor(name: string, price: number, stock: number) {
    this._name = new Name(name);
    this._price = new Price(price);
    this._stock = new Stock(stock);
  }

  get name(): string {
    return this._name.getValue();
  }

  set name(value: string) {
    this._name = new Name(value);
  }

  get price(): number {
    return this._price.getValue();
  }

  get stock(): number {
    return this._stock.getValue();
  }

  set stock(value: number) {
    this._stock = new Stock(value);
  }

  updatePrice(newPrice: number): void {
    this._price = new Price(newPrice);
  }

  reduceStock(quantity: number): void {
    this._stock = this._stock.subtract(quantity);
  }

  addStock(quantity: number): void {
    this._stock = this._stock.add(quantity);
  }
}
