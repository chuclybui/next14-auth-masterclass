"use server";

import { signOut } from "@/auth"

 export const logout = async () => {
// do some server stuffs before sign out

  await signOut({redirectTo:"http://localhost:3000/auth/login"});
  
}