import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/homePage";
import {SignUp} from "./pages/SignUp";
import { LoginPage } from "./pages/loginPage";
import "./App.css"
import ProtectedRoute from "./components/protectedRoute";
import { useAuth } from "./context/AuthContext";
import { Onboarding } from "./pages/Onboarding";
import { ExercisePage } from "./pages/Exercise/ExercisePage";

export function App(){

  const {user} = useAuth();

  return <>
  <BrowserRouter>
    <Routes>
        <Route path="/signUp" element={<SignUp/>}/>
        <Route path="/logIn" element={<LoginPage/>}/>
        <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
        <Route path="/onboarding" element={<ProtectedRoute>
          <Onboarding/>
        </ProtectedRoute>}/>
        <Route path="/exercise" element={<ProtectedRoute><ExercisePage/></ProtectedRoute>}/>
    </Routes>
  </BrowserRouter>
  </>
}

