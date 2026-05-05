import {
  Customer,
  GetCustomerByIdParams,
  InAppNotificationTransport,
} from '@/shared/types';

export class CustomersService {
  constructor(private readonly transport: InAppNotificationTransport) {}

  async getById({
    projectId,
    customerPoolModule,
    customerPoolId,
    customerId,
    attributeTypes = 'all',
  }: GetCustomerByIdParams) {
    return this.transport.getCustomerById({
      projectId,
      customerPoolModule,
      customerPoolId,
      customerId,
      attributeTypes,
    });
  }
}
