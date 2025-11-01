import { createContext } from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { io } from "socket.io-client";

// Backend URL configuration - localhost only
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;

 export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  //check if user is authenticated and if so, set the user data and connect the socket
  const checkAuth = async () => {
    // Only check auth if token exists
    if (!token) {
      return;
    }
    
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      // 401 is normal when token is invalid/expired - handle silently
      if (error.response?.status === 401) {
        // Clear invalid token
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        return;
      }
      // Only show error for other issues
      if (error.response?.status !== 401) {
        console.error("Auth check error:", error);
        toast.error("Cannot connect to server. Please check your connection.");
      }
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
      console.error("Login error:", error);
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error("Cannot connect to server. Please check your internet connection.");
      } else {
        toast.error(error.response?.data?.message || error.message || "Login failed");
      }
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




  // connect socket function to handle socket connection and online users updates
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    
    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      transports: ["polling", "websocket"],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    });
    
    newSocket.on("connect_error", (error) => {
      // Silent error handling - socket will auto-retry
      // Only log for debugging, don't show toast
    });
    
    newSocket.on("reconnect", () => {
      // Silent reconnect - connection restored automatically
    });
    
    newSocket.on("reconnect_error", (error) => {
      // Silent error - socket will keep trying
    });
    
    setSocket(newSocket);
    
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    } else {
      // Clear auth state if no token
      setAuthUser(null);
      setOnlineUsers([]);
      socket?.disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
