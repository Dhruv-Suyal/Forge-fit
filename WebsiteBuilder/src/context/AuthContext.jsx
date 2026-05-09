import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/axios";

const AuthContext = createContext();

export function AuthProvider({children}){
    const [user, setUser] = useState(null);

    useEffect(()=>{
        api.get("/auth/me").then((res)=>{
            setUser(res.data.user);
        }).catch(()=>{
            setUser(null);
        })
    }, []);

    return (
        <AuthContext.Provider value={{user, setUser}} >
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = ()=> useContext(AuthContext);