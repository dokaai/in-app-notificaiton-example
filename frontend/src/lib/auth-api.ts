"use client";

import { requestBff } from "@/lib/bff-client";

export interface CustomerJwtRequest {
  privateKey: string;
  signingKeyId: string;
  uniqueCustomerId: string;
  workspaceId: string;
  productSpaceCode: string;
  currentToken?: string;
  expiresIn?: string;
}

export interface CustomerJwtResponse {
  success: boolean;
  message?: string;
  jwtToken: string;
  expirationTime: number | null;
  refreshed: boolean;
}

export function requestCustomerJwt(input: CustomerJwtRequest) {
  return requestBff<CustomerJwtResponse>("/api/auth/customer-token", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
