"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {useState, useTransition } from "react";
import { useSession } from "next-auth/react";

import { SettingSchema } from "@/schemas";
import { UserRole } from "@prisma/client";
import { useCurrentUser } from "@/hooks/use-current-user";

import { settings } from "@/actions/settings";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,  
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,

} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectLabel,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
 } from "@/components/ui/select";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";
import { Switch } from "@/components/ui/switch";




const SettingPage = () => {
  const user = useCurrentUser();
  const { update } = useSession();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SettingSchema>>({
    resolver: zodResolver(SettingSchema),
    defaultValues: {
      password: undefined,
      newPassword: undefined,
      name: user?.name || undefined,
      email: user?.email || undefined,     
      role: user?.role || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
      
    },
  })

  const onSubmit = (values: z.infer<typeof SettingSchema>) => {
    startTransition(() => {
      settings(values)
      .then((data) => {
        if (data?.error) {
          setError(data.error);
        };
        if (data?.success) {
          update();
          setSuccess(data.success);
        }
    })
       .catch(() => setError("Something went wrong!"));
  });
};
 
  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center  ">
          Setting
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Lucy"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
               )}
              />
              { user?.isOAuth === false && (
                <>
                <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                    {...field}
                    disabled={isPending}
                    type="email"
                    placeholder="lucy@example.com"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
               )}
              />
               <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                    {...field}
                    disabled={isPending}
                    type="password"
                    placeholder="******"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
               )}
              />
               <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input
                    {...field}
                    disabled={isPending}
                    type="password"
                    placeholder="******"/>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
               )}
              />
                </>
              )}               
               <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                   <Select
                   disabled={isPending}
                   onValueChange={field.onChange}
                   defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="select a role"/>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value = {UserRole.ADMIN}>
                        Admin
                      </SelectItem>
                      <SelectItem value = {UserRole.USER}>
                        User
                      </SelectItem>
                    </SelectContent>
                   </Select>
                   <FormMessage />
                </FormItem>
               )}
              />
              { user?.isOAuth === false && (
                       <FormField
                       control={form.control}
                       name="isTwoFactorEnabled"
                       render={({ field }) => (
                         <FormItem className="flex flex-row items-center justify-between
                         border rounded-lg p-3 shadow-sm">
                           <div className="space-y-0.5">
                             <FormLabel> Two Factor Authentication</FormLabel>
                             <FormDescription>
                               Enable two factor authentication for your account
                             </FormDescription>
                           </div>
                           <FormControl>
                             <Switch 
                             disabled={isPending}
                             checked={field.value}
                             onCheckedChange={field.onChange}
                             />
                           </FormControl>
                           <FormMessage/>
                         </FormItem>
                        )}
                       />
              )}
          
            </div>
            <FormError message={error}/>
            <FormSuccess message={success}/>
            <Button 
              disabled={isPending}
              type="submit"
              >
                 Save
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  
  )
}

export default SettingPage;