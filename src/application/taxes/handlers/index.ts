import { CreateTaxHandler } from './create-tax.handler';
import { UpdateTaxHandler } from './update-tax.handler';
import { DeleteTaxHandler } from './delete-tax.handler';
import { GetTaxesHandler } from './get-taxes.handler';
import { GetTaxHandler } from './get-tax.handler';

export const TaxHandlers = [
  CreateTaxHandler,
  UpdateTaxHandler,
  DeleteTaxHandler,
  GetTaxesHandler,
  GetTaxHandler,
];
