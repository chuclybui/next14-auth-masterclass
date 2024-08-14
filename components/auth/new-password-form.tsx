"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";

import { setNewPassword } from "@/actions/setNewPassword";
import { NewPasswordSchema } from "@/schemas";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { 
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
 } from "@/components/ui/form";
 import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [ error, setError ] = useState<string | undefined>("");
  const [ success, setSuccess ] = useState<string | undefined>("");
  const [ isPending, startTransition] = useTransition();

  const form = useForm<z.infer< typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    }
  })
  // if (!token) return null;

  const onSubmit = (values:z.infer< typeof NewPasswordSchema>) => {
    setError("");
    setSuccess("");  
    startTransition(() => {
      setNewPassword(values, token)
      .then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      })
    })
  }
  return (
    <CardWrapper
    headerLabel="Enter a new password"
    backButtonLabel="back to login"
    backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form
         onSubmit={form.handleSubmit(onSubmit)}
         className="space-y-6">
          <div className="space-y-4">
            <FormField 
             control={form.control}
             name="password"
             render = {({ field}) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  {...field}
                  placeholder="******"
                  type="password"
                  />
              </FormControl>
              <FormMessage />
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
            Reset password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}