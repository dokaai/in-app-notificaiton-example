export interface CustomerAttribute {
  id?: string;
  fieldName?: string;
  attributeType?: string;
  value?: unknown;
  [key: string]: unknown;
}

export interface Customer {
  id: string;
  externalId?: string;
  attributes?: CustomerAttribute[];
  [key: string]: unknown;
}

export interface GetCustomerByIdParams {
  projectId: string;
  customerPoolModule: string;
  customerPoolId: string;
  customerId: string;
  attributeTypes?: string;
}
