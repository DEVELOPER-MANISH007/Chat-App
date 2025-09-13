import { createContext } from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { io } from "socket.io-client";

// Backend URL configuration - try multiple possible URLs
const possibleUrls = [
  import.meta.env.VITE_BACKEND_URL,
  "https://chat-app-server-developer-manish007s-projects.vercel.app",
  "https://server-developer-manish007s-projects.vercel.app",
  "https://chat-app-backend.vercel.app",
  "https://chat-app-server.vercel.app"
];

const backendUrl = possibleUrls.find(url => url) || "https://chat-app-server-developer-manish007s-projects.vercel.app";
axios.defaults.baseURL = backendUrl;

// Log backend URL for debugging
console.log("Backend URL:", backendUrl);

// Test server connection immediately
const testServer = async () => {
  try {
    console.log("Testing server connection...");
    const response = await fetch(`${backendUrl}/api/status`);
    const data = await response.text();
    console.log("Server response:", data);
    if (response.ok) {
      console.log("✅ Server is working!");
    } else {
      console.log("❌ Server returned error:", response.status);
    }
  } catch (error) {
    console.log("❌ Server connection failed:", error.message);
    console.log("Trying alternative URLs...");
    
    // Try alternative URLs
    const alternatives = [
      "https://chat-app-server.vercel.app",
      "https://server-developer-manish007s-projects.vercel.app",
      "https://chat-app-backend.vercel.app"
    ];
    
    for (const altUrl of alternatives) {
      try {
        const response = await fetch(`${altUrl}/api/status`);
        if (response.ok) {
          console.log("✅ Found working server:", altUrl);
          axios.defaults.baseURL = altUrl;
          break;
        }
      } catch (e) {
        console.log("❌ Failed:", altUrl);
      }
    }
  }
};

// Test server on load
testServer();

 export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  //check if user is authenticated and if so, set the user data and connect the socket
  const checkAuth = async () => {
    try {
      console.log("Checking auth with backend URL:", backendUrl);
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Don't show toast for auth check errors as it might be normal for unauthenticated users
      if (error.response?.status !== 401) {
        toast.error("Cannot connect to server. Please check your connection.");
      }
    }
  };

  //Login function to handle user authentication and socket connection
  const login = async (state, Credential) => {
    try {
      console.log("Attempting to login with backend URL:", backendUrl);
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
    
    console.log("Connecting to socket with backend URL:", backendUrl);
    
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
    
    newSocket.on("connect", () => {
      console.log("Socket connected successfully with ID:", newSocket.id);
    });
    
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Connection failed. Retrying...");
    });
    
    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      toast.success("Connection restored!");
    });
    
    newSocket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
      toast.error("Reconnection failed");
    });
    
    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
    
    setSocket(newSocket);
    
    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("Received online users:", userIds);
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
