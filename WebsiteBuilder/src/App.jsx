import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/homePage";
import {SignUp} from "./pages/SignUp";
import { LoginPage } from "./pages/loginPage";
import "./App.css"
import ProtectedRoute from "./components/protectedRoute";
import { useAuth } from "./context/AuthContext";

export function App(){

  const {user} = useAuth();

  return <>
  <BrowserRouter>
    <Routes>
        <Route path="/signUp" element={<SignUp/>}/>
        <Route path="/logIn" element={<LoginPage/>}/>
        <Route path="/" element={<Home/>}/>

    </Routes>
  </BrowserRouter>
  </>
}

