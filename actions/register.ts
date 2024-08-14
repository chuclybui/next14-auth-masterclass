"use server";

import * as z from "zod";
import bryptjs from "bcrypt";

import { RegisterSchema } from "@/schemas";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async ( values: z.infer<typeof RegisterSchema> ) => {
  const validatedFields = RegisterSchema.safeParse(values);  

  if (!validatedFields.success) {
    return { error: "invalid fields!"};
  }

  const { name, email, password } = validatedFields.data;
  const hashPassword = await bryptjs.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if ( existingUser ) {
    return {
      error: "Email already in use!"
    }
  };

  await db.user.create({
    data: {
      name,
      email,
      password: hashPassword,
    }
  });
   
  const verificationToken = await generateVerificationToken(email);
  
   await sendVerificationEmail(
    verificationToken.email,
    verificationToken.token
  )
  return { success: "Email confirmation sent."};
};