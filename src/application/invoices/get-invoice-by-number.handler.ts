import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInvoiceByNumberQuery } from './get-invoice-by-number.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../common/interfaces/invoice.repository.interface';
import { IClientRepository } from '../common/interfaces/client.repository.interface';
import { IUserRepository } from '../common/interfaces/user.repository.interface';
import { TOKENS } from '../common/tokens/tokens';
import {
  InvoiceReconstructionDto,
  InvoiceDetailDto,
  InvoiceDetailTaxDto,
  ClientInfoDto,
  SellerInfoDto,
} from '../dto/invoices/get-invoice-by-number.dto';

@QueryHandler(GetInvoiceByNumberQuery)
export class GetInvoiceByNumberHandler
  implements IQueryHandler<GetInvoiceByNumberQuery>
{
  constructor(
    @Inject(TOKENS.INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(TOKENS.CLIENT_REPOSITORY)
    private readonly clientRepository: IClientRepository,
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    query: GetInvoiceByNumberQuery,
  ): Promise<InvoiceReconstructionDto> {
    // Buscar invoice por invoiceNumber
    const invoice = await (
      this.invoiceRepository as any
    ).findByInvoiceNumber(query.invoiceNumber);

    if (!invoice) {
      throw new NotFoundException(
        `Invoice with number ${query.invoiceNumber} not found`,
      );
    }

    // Obtener cliente y vendedor
    const client = invoice.clientId
      ? await this.clientRepository.findById(invoice.clientId)
      : null;

    const seller = invoice.userId
      ? await this.userRepository.findById(invoice.userId)
      : null;

    // Mapear detalles con taxes
    const details: InvoiceDetailDto[] = (invoice.details || []).map(
      (detail: any) => {
        const taxes: InvoiceDetailTaxDto[] = (detail.detailTaxes || []).map(
          (dt: any) => ({
            taxId: dt.taxId,
            taxName: dt.tax?.name || 'Unknown',
            rateSnapshot: Number(dt.rateSnapshot) || 0,
            calculatedAmountSnapshot:
              Number(dt.calculatedAmountSnapshot) || 0,
          }),
        );

        const unitPrice = Number(detail.unitPriceSnapshot) || 0;
        const quantity = detail.quantity || 0;
        const subtotal = unitPrice * quantity;

        return {
          id: detail.id,
          productId: detail.productId,
          productName: detail.productName,
          quantity,
          unitPriceSnapshot: unitPrice,
          subtotal,
          taxes,
        };
      },
    );

    // Mapear cliente
    const clientInfo: ClientInfoDto | null = client
      ? {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phone: client.phone,
          address: client.address,
        }
      : null;

    // Mapear vendedor
    const sellerInfo: SellerInfoDto | null = seller
      ? {
          id: seller.id,
          username: seller.username,
          name: seller.name,
          lastName: seller.lastName,
          email: seller.email,
        }
      : null;

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      status: invoice.status,
      paymentMethod: invoice.paymentMethod,
      transactionId: invoice.transactionId,
      subtotalSnapshot: Number(invoice.subtotalSnapshot) || 0,
      taxTotalSnapshot: Number(invoice.taxTotalSnapshot) || 0,
      totalSnapshot: Number(invoice.totalSnapshot) || 0,
      client: clientInfo,
      seller: sellerInfo,
      details,
    };
  }
}
