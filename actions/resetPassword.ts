"use server";

import * as z from "zod";

// import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { ResetPasswordSchema } from "@/schemas";
import { getResetPasswordTokenByEmail } from "@/data/resetPassword-token";
import { generateResetPasswordToken } from "@/lib/tokens";
import { sendResetPasswordEmail } from "@/lib/mail";

export const resetPassword=  async (values: z.infer< typeof ResetPasswordSchema>) => {

  const validatedFields = ResetPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "invalid email!"}
  };
   const { email } = validatedFields.data;  

  const existingUser = await getUserByEmail(email);

  if ( !existingUser ) {
    return { error: " Email does not exist!"};
  }

  // const existingResetPasswordToken = await getResetPasswordTokenByEmail(email);

  // if ( existingResetPasswordToken ) {
  //   await db.resetPasswordToken.delete({
  //     where: { id: existingResetPasswordToken.id }
  //   })
  // }

  const resetPasswordToken = await generateResetPasswordToken(email);

   await sendResetPasswordEmail(
     resetPasswordToken.email,
     resetPasswordToken.token
   )
   
   return { success: " reset password email sent"};   
}