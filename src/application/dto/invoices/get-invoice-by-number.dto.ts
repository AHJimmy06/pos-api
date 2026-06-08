export interface InvoiceDetailTaxDto {
  taxId: number;
  taxName: string;
  rateSnapshot: number;
  calculatedAmountSnapshot: number;
}

export interface InvoiceDetailDto {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceSnapshot: number;
  subtotal: number;
  taxes: InvoiceDetailTaxDto[];
}

export interface ClientInfoDto {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface SellerInfoDto {
  id: number;
  username: string;
  name: string;
  lastName: string;
  email: string;
}

export interface InvoiceReconstructionDto {
  id: number;
  invoiceNumber: string;
  issueDate: Date;
  status: string;
  paymentMethod: string;
  transactionId: string | null;
  subtotalSnapshot: number;
  taxTotalSnapshot: number;
  totalSnapshot: number;
  clientNameSnapshot?: string;
  clientEmailSnapshot?: string;
  sellerNameSnapshot?: string;
  parentInvoiceId?: number;
  client: ClientInfoDto | null;
  seller: SellerInfoDto | null;
  details: InvoiceDetailDto[];
}
