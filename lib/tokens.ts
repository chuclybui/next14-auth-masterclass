import { v4 as uuidv4 } from "uuid";
import cripto from "crypto";

import { db } from "@/lib/db";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { getResetPasswordTokenByEmail } from "@/data/resetPassword-token";
import { getTwoFactorTokenByEmail } from "@/data/two-Factor-token";

export const generateTwoFactorToken = async (email: string) => {
  const token = cripto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000); 

  const existingTwoFactorToken = await getTwoFactorTokenByEmail(email);

  if (existingTwoFactorToken) {
    await db.twoFactorToken.delete({
      where: {
        id: existingTwoFactorToken.id,
      },
    });
  }
  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    }
  });

  return twoFactorToken;
};

export const generateResetPasswordToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); 

  const existingResetPasswordToken = await getResetPasswordTokenByEmail(email);

  if (existingResetPasswordToken) {
    await db.resetPasswordToken.delete({
      where: {
        id: existingResetPasswordToken.id,
      },
    });
  }

  const resetPasswordToken = await db.resetPasswordToken.create({
    data: {
      email,
      token,
      expires,
    }
  });

  return resetPasswordToken;
};
 
export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    }
  });

  return verificationToken;
};
