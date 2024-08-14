import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user"; 
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";


export const { 
  auth,
  handlers,
  signIn,
  signOut,  
 } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id},
        data: { emailVerified: new Date()}
      })
    }
  },
  callbacks: {  
    async signIn ({  user, account}) {
     // allow OAuth without email verification
     if (account?.provider !== "credentials") return true;

     if (!user.id) return false;
     const existingUser = await getUserById(user.id);
      
     if ( !existingUser?.emailVerified ) return false;

     if (existingUser.isTwoFactorEnabled) {
      const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

        if(!twoFactorConfirmation) return false;

      // Delete two factor confirmation for next sign in
         await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id}
         });
    }

     return true;
    },
    async session ({ token, session }) {           
      if ( token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      if (token.role && session.user) {
        session.user.role = token.role;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth;
      }
      
      return session;
    },
    async jwt({ token}) {
      if (!token.sub)  return token;

      const existingUser = await getUserById(token.sub);

      if(!existingUser) return token;

      const isOAuthAccount = await getAccountByUserId(existingUser.id);
      
      token.isOAuth = !!isOAuthAccount;

      token.name = existingUser.name;
      
      token.email = existingUser.email;

      token.role = existingUser.role;
      
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      
      return token;
    }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt"},  
  ...authConfig,
});