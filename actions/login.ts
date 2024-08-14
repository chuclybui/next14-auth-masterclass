"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import { getUserByEmail } from "@/data/user";
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/tokens";
import { db } from "@/lib/db";
import { getTwoFactorTokenByEmail } from "@/data/two-Factor-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";

export const login = async ( 
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,

) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "invalid fields!"};
  }

  const { email, password, code} = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if ( !existingUser || !existingUser.email || !existingUser.password ) {
    return { error: "Email does not exist" }
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email,
    )
  
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )
    return { success: "Confirmation email sent"};
  };

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { error: "invalid code!"}
      }

      if (twoFactorToken.token !== code) {
        return { error: "invalid code!"}
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) {
        return { error: "code expired!"}
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id}
      });

      const existingTwoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

      if ( existingTwoFactorConfirmation) {
         await db.twoFactorConfirmation.delete({
          where: { id: existingTwoFactorConfirmation.id}
         })
      }

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id}
      })

    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)  
 
      await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token,
     );

      return { twoFactor: true}; 
    } 
    
  }      
      try {
        await signIn("credentials", {
          email,
          password,
          redirectTo:  callbackUrl || DEFAULT_LOGIN_REDIRECT,
        })
      } catch (error) {
        if (error instanceof AuthError) {
          switch (error.type) {
            case "CredentialsSignin":
              return { error: "invalid credentials!"}
            default:
              return { error: "Something went wrong!"}
          }
        }
    
        throw error;
      }   
  
    }
   
    
   

