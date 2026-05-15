import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({children}){
   const { user, loading } = useAuth();

   if(loading) return (
      <div style={{
         minHeight:"100vh", background:"#00000a",
         display:"flex", alignItems:"center", justifyContent:"center",
         fontFamily:"'JetBrains Mono',monospace", fontSize:13,
         color:"rgba(0,245,212,0.6)", letterSpacing:2
      }}>
         SYNCING...
      </div>
   );

   return user ? children : <Navigate to={"/logIn"}/>;
}

export default ProtectedRoute;
