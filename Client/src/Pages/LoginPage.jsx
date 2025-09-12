import { React, useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../Context/AuthContext.jsx"; 

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign-Up");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const {login} = useContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (currState === "Sign-Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    login(currState==="Sign-Up"?'signup':'login',{email,password,fullName,bio})
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-centergap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* ------lEFT------ */}
      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />
      {/* ------Right------ */}
      <form 
      onSubmit={onSubmitHandler}
       className="border-2 bg-white/8 border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">
        <h2 className="font-medium text-2xl flex justify-between items-center text-white">
          {currState}
          {isDataSubmitted && (
            <img
            onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt=""
              className="w-5 cursor-pointer"
            />
          )}
        </h2>
        {currState === "Sign-Up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            placeholder="Full Name"
            className=" text-white p-2 rounded-md border-gray-500 border focus:outline-none"
            required
          />
        )}
        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              required
              className="text-white p-2 border border-gray-500
               rounded-md focus:outline focus:ring-2
                focus:ring-indigo-500"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Enter Password"
              required
              className=" text-white p-2 border border-gray-500
               rounded-md focus:outline focus:ring-2
                focus:ring-indigo-500"
            />
          </>
        )}
        {currState === "Sign-Up" && isDataSubmitted && (
          <textarea
            rows="4"
            placeholder="prove a short bio..."
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            type="text"
            className=" text-white p-2 border border-gray-500
               rounded-md focus:outline focus:ring-2
                focus:ring-indigo-500"
          ></textarea>
        )}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600
         text-white rounded-md cursor-pointer"
        >
          {currState === "Sign-Up" ? "Create Account" : "Login Now"}
        </button>
        <div className="flex items-center gap-2 text-sm ttext-gray-500 text-white">
          <input type="checkbox" />
          <p>Agree terms of use & privacy policy.</p>
        </div>
        <div className="flex flex-col gap-2">
          {currState === "Sign-Up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login Here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Create an account{" "}
              <span
                onClick={() => {
                  setCurrState("Sign-Up");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                click Here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
