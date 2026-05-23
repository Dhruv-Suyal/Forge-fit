import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/homePage";
import {SignUp} from "./pages/SignUp";
import { LoginPage } from "./pages/loginPage";
import "./App.css"
import ProtectedRoute from "./components/protectedRoute";
import { useAuth } from "./context/AuthContext";
import { Onboarding } from "./pages/Onboarding";
import { ExercisePage } from "./pages/Exercise/ExercisePage";
import { Diet } from "./pages/Diet/Diet";
import HealthPage from "./pages/Health/HealthPage";

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
        <Route path="/diet" element={<ProtectedRoute><Diet/></ProtectedRoute>}/>
        <Route path="/health" element={<ProtectedRoute><HealthPage/></ProtectedRoute>}/>
    </Routes>
  </BrowserRouter>
  </>
}

