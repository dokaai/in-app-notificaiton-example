export interface LoginPayload {
  customerJwtPrivateKey: string;
  customerSigningKeyId: string;
  customerUniqueCustomerId: string;
  customerWorkspaceId: string;
  customerProductSpaceCode: string;
  jwtToken: string;
}

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
}
