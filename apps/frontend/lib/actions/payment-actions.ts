"use server";

import { revalidatePath } from "next/cache";
import { paymentService } from "@/lib/api/services";
import { VerifyPaymentDto } from "@/lib/api/types";

export async function verifyPayment(
  paymentId: string,
  data: VerifyPaymentDto
) {
  try {
    const success = await paymentService.verifyPayment(paymentId, data);
    if (!success) {
      throw new Error("API failed to verify payment.");
    }
    
    revalidatePath("/dashboard/payments/pending");
    return { success: true };
    
  } catch (error) {
    console.error("Error verifying payment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}