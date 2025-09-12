import React from "react";
import SideBar from "../Components/SideBar";
import ChatContainer from "../Components/ChatContainer";
import RightSideBar from "../Components/RightSideBar";
import { useContext } from "react";
import { ChatContext } from "../../Context/ChatContext";

const Home = () => {

 const { selectedUser } = useContext(ChatContext);

  return (
    <div className="w-full h-screen border sm:px-[10%] sm: py-[5%]">
      <div
        className={`backdrop-blur-xl border-2 h-[100%] border-gray-600 rounded-2xl overflow-hidden grid grid-cols-1 relative  ${
          selectedUser
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr] "
            : "md:grid-cols-2"
        }`}
      >
        <SideBar   />
        <ChatContainer  />
        <RightSideBar />
      </div>
    </div>
  );
};

export default Home;
