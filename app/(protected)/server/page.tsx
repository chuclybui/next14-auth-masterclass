import { UserInfor } from "@/components/user-infor";
import { currentUser } from "@/lib/auth";

const ServerPage = async () => {
  const user = await currentUser();

  return (
    <UserInfor   
      label=" Server Component"
      user={user} 
      />       
  )
  
}

export default ServerPage;