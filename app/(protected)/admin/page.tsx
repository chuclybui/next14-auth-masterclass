"use client";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";

import { RoleGate } from "@/components/auth/role-gate";
import { FormSuccess } from "@/components/form-success";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { admin } from "@/actions/admin";



const AdminPage = () => {
  const onServerActionClick = () => {
    admin()
    .then((data) => {
      if (data.error) {
          toast.error(data.error);
      }
      if (data.success) {
          toast.success(data.success);
      }
    })
  }

  const onApiRouteClick = () => {
    fetch("/api/admin")
    .then((response) => {
      if (response.ok) {
        toast.success("Allowed API route")
      } else {
        toast.error("Forbidden API route");
      }
    })
  }

 return (
  <Card className="w-[600px]">
    <CardHeader>
      <p className="text-2xl font-semibold text-center">Admin</p>
    </CardHeader>
    <CardContent className="space-y-4">
      <RoleGate allowedRole={UserRole.ADMIN}>
        <FormSuccess message="you are allowed to see this content"/>        
      </RoleGate>
      <div className="flex flex-row items-center justify-between border rounded-lg p-3 shadow-md">
        <p className="text-sm font-medium">
          Admin-only API route
        </p>
        <Button onClick={onApiRouteClick}>
          Click to test
        </Button>
      </div>
      <div className="flex flex-row items-center justify-between border rounded-lg p-3 shadow-md">
        <p className="text-sm font-medium">
          Admin-only Server Action
        </p>
        <Button onClick={onServerActionClick}>
          Click to test
        </Button>
      </div>

    </CardContent>
  </Card>

 )

}

export default AdminPage;