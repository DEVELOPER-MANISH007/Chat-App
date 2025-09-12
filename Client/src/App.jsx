import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import {Toaster} from "react-hot-toast"
import { AuthContext } from "../Context/AuthContext";

const App = () => {
  const {authUser} = useContext(AuthContext);
  return (
    <div className="bg-[url('./assets/bgImage.svg')] bg-contain ">
      <Toaster/>
      <Routes>
        <Route path="/" element={authUser ? <Home />:<Navigate to="/login"/>} />
        <Route path="/login" element={!authUser ? <LoginPage/> :<Navigate to="/"/>} />
        <Route path="/profile" element={ authUser ? <ProfilePage /> : <Navigate to="/login"/> } />
        
      </Routes>
    </div>
  );
};

export default App;
