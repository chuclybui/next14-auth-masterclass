"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { NewPasswordSchema } from "@/schemas";
import { getResetPasswordTokenByToken } from "@/data/resetPassword-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";


export const setNewPassword = async (
  values: z.infer< typeof NewPasswordSchema>,
  token?: string | null) => {

  if(!token) {
    return { error: "Missing token!"};
  };
  
  const validatedFields = NewPasswordSchema.safeParse(values);

  if(!validatedFields.success) {
    return { error: "invalid fields"}  }

  const { password: newPassword} = validatedFields.data;  

  const existingResetPasswordToken = await getResetPasswordTokenByToken(token);

  if(!existingResetPasswordToken) {
    return { error: " Token does not exist"};
  };

  const hasExpired = new Date(existingResetPasswordToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!"}
  }
  
  const existingUser = await getUserByEmail(existingResetPasswordToken.email);

  if(!existingUser) {
    return { error: " Email does not exist!"};
  }
  const hashPassword = await bcrypt.hash(newPassword, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data:{
      password: hashPassword,
    }
  })
  await db.resetPasswordToken.delete({
    where: {id: existingResetPasswordToken.id}
  })
  return { success: "password updated"};
  
}