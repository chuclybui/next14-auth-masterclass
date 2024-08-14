"use client";

import { UserInfor } from "@/components/user-infor";
import { useCurrentUser } from "@/hooks/use-current-user";

const ClientPage = () => {
  const user = useCurrentUser();

  return (
    <UserInfor
    label="Client Component"
    user={user}
    />
  )
}

export default ClientPage;