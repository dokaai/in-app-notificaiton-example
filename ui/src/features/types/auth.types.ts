export interface LoginPayload {
  projectId: string;
  orgId: string;
  customerPoolId: string;
  customerId: string;
  jwtToken: string;
}

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
}
