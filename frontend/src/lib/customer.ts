"use client";

import type { CustomerDetails } from "@/features/types/auth.types";

export function buildCustomerDetails(uniqueCustomerId: string): CustomerDetails {
  return {
    id: uniqueCustomerId,
    name: uniqueCustomerId,
    email: `${uniqueCustomerId.toLowerCase()}@demo.dokaai.ai`,
  };
}
