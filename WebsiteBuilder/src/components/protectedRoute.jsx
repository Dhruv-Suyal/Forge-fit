import { useEffect, useState } from "react";
import api from "../utils/axios";
import { Navigate } from "react-router-dom";


function ProtectedRoute({children}){
   const [IsAuth, SetAuth] = useState(null);

   useEffect(()=>{

            api.get("auth/me").then(()=>{
                SetAuth(true);
            }).catch(()=>{
                SetAuth(false);
            })
   },[]);

    if(IsAuth==null) return <h1>Loading....</h1>

    return IsAuth ? children : <Navigate to={"/logIn"}/>
}

export default ProtectedRoute;
