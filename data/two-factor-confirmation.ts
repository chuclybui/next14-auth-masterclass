import { db } from "@/lib/db";

export const getTwoFactorConfirmationByUserId = async ( userId: string) => {
  try {
    const twoFCConfirmation = await db.twoFactorConfirmation.findUnique({
      where: { userId }
    });
    
     return twoFCConfirmation;

  } catch {
    return null;
  }
}
