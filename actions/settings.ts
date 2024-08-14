"use server";

import * as z from "zod";
import bcryptjs from "bcryptjs";

import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingSchema } from "@/schemas";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { auth } from "@/auth";

export const settings = async (values: z.infer<typeof SettingSchema>) => {
   const user = await currentUser();   

   if (!user) {
    return { error: " unauthorized!"}
   }

   const dbUser = await getUserById(user.id as string);

   if (!dbUser) {
      return { error: "unauthorized!"}
   }
   
   if(user.isOAuth) {
      values.email = undefined;
      values.password=undefined;
      values.newPassword=undefined;
      values.isTwoFactorEnabled=undefined;
   }

   if (values.email && values.email !== user.email) {
      const existingUser = await getUserByEmail(values.email);
      
      if ( existingUser && existingUser.id !== user.id) {
         return { error: " Email already in use!"}
      }

      const verificationToken = await generateVerificationToken(values.email);
      
      await sendVerificationEmail(
         verificationToken.email,
         verificationToken.token,
      );
      return { success:"verification email sent"}
   }

   if (values.password && values.newPassword && dbUser.password) {
       const passwordMatch = await bcryptjs.compare(
         values.password,
         dbUser.password,
       )

       if (!passwordMatch) {
         return { error: " incorrect password!"}
       }

       const hashPassword = await bcryptjs.hash( values.newPassword, 10);
      
       values.password = hashPassword;
       values.newPassword = undefined;

   }

   await db.user.update({
      where: { id: dbUser.id},
      data: {
         ...values,
      }
   })
    return { success: " settings updated"}
}