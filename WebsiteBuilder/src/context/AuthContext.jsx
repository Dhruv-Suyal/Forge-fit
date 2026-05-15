import { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/axios";

const AuthContext = createContext();

export function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        api.get("/auth/me")
            .then((res)=>{
                setUser(res.data.user);
                setProfile(res.data.profile || null);
            })
            .catch(()=>{
                setUser(null);
                setProfile(null);
            })
            .finally(()=>{
                setLoading(false);
            });
    }, []);

    return (
        <AuthContext.Provider value={{user, setUser, profile, setProfile, loading}} >
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = ()=> useContext(AuthContext);