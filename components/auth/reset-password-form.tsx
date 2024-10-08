"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ResetPasswordSchema } from "@/schemas";

import {
Form,
FormControl,
FormField,
FormItem,
FormLabel,
FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { resetPassword } from "@/actions/resetPassword";

 export const ResetPasswordForm = () => {  
   const [ error, setError ] = useState<string | undefined>("");
   const [ success, setSuccess ] = useState<string | undefined>("")
   const [ isPending, startTransition ] = useTransition();
   const form = useForm<z.infer< typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",     
    }
     });

     const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
      setError("");
      setSuccess("");
      startTransition(() => {
        resetPassword(values)
          .then((data) => {
            setError(data?.error);            
            setSuccess(data?.success);
          })
      });
     }
  return (
    <CardWrapper
    headerLabel="Reset password"
    backButtonLabel="Back to login"
    backButtonHref="/auth/login"    
    >
      <Form {...form}>
        <form 
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6">
          <div className="space-y-4">
            <FormField           
             control={form.control}
             name="email"
             render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                  disabled={isPending}
                  {...field}
                  placeholder="lylycoder@example.com"
                  type="email"
                  />
                </FormControl>
                <FormMessage/>
              </FormItem>
             )}
            />
          </div> 
          <FormError message={error}/>
          <FormSuccess message={success}/>
          <Button
          type="submit"
          className="w-full"
          >
            send reset email
          </Button>       
        </form>
      </Form>
    </CardWrapper>
  )
}