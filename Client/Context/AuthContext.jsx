import { createContext } from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

 export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  //check if user is authenticated and if so, set the user data and connect the socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //Login function to handle user authentication and socket connection
  const login = async (state, Credential) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, Credential);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  // Logout function to handle user logout and socket disconnection
  const logout = async () => {
      localStorage.removeItem("token"); 
      setAuthUser(null);
      setOnlineUsers([]);   
      axios.defaults.headers.common["token"] = null;
      setToken(null);
      socket?.disconnect();
  }


  // Update Profile function to handle user profile updates
const updateProfile = async (body) => {
    try {
        const {data}= await axios.put('/api/auth/update-profile', body)
        if(data.success){
            // Server returns updated user as `userData`
            setAuthUser(data.userData);
            toast.success("Profile Updated Successfully")
        }
        return data;
    } catch (error) {
        toast.error(error.message)
        return { success: false, message: error.message };
    }
}




  // connect socket funnction to handle socket connection and online users updates
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  },[token]);                   // yaha se token ht skta hai err ayega to

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile
  };
  return (
  <AuthContext.Provider value={value}>
    {children}
    </AuthContext.Provider>
    )
};
