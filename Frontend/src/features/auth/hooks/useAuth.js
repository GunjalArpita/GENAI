import {  useContext ,useEffect } from "react";
import { AuthContext } from "../auth.context";
import {login,register,logout,getMe} from "../services/auth.api";
export const useAuth = () => {

    const context =  useContext(AuthContext);

    const {user,setUser,loading,setLoading}=context

const handleLogin =  async ({email,password}) =>
{
    setLoading(true)

try{
    const data = await login({email,password})
    setUser(data.user)

}
    catch(error)
    {
        console.error("Login failed:", error.response?.data?.message || error.message);
        alert(error.response?.data?.message || "Login failed");
    }
    finally{
     setLoading(false)
    }
   
}

const handleRegister = async ({username,email,password}) => 
{
    setLoading(true)
    try{
       const data = await register({username,email,password})
    setUser(data.user)
    }
    catch(error){
        console.error("Register failed:", error.response?.data?.message || error.message);
        alert(error.response?.data?.message || "Registration failed");
    }
   finally{
   setLoading(false)
   }
   
}

const handleLogout =  async ()=>
{
    setLoading(true)
    try{
         await logout()
         setUser(null)
    }
    catch(err)
    {
        console.error("Logout failed:", err.response?.data?.message || err.message);
    }
    finally{
      setLoading(false)
    }
   
    
}



useEffect(() => {
    const getAndSetUser = async() =>
    {
        try{
            // Only attempt to get user if token exists in localStorage
            const token = localStorage.getItem('authToken');
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }
            
            const data = await getMe()
            setUser(data.user)
        }
        catch(error)
        {
            console.log("Error fetching user:", error);
            setUser(null)
        }
        finally{
            setLoading(false)
        }
    }

    getAndSetUser()
},[setUser, setLoading])

return {user,loading,handleRegister,handleLogin,handleLogout}

}