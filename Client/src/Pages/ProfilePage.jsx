import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [selectedImg, setselectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      const res = await updateProfile({ fullName: name, bio });
      if (res?.success) navigate("/");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;
      const res = await updateProfile({ profilePic: base64Image, fullName: name, bio });
      if (res?.success) navigate("/");
    };
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl rounded-lg text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse">
        <form
          onSubmit={onSubmitHandler}
          className="  flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg text-white ">Profile Details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setselectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png,.jpg,.jpeg"
              hidden
            />
            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic || assets.avatar_icon
              }
              alt=""
              className="w-16 h-16 rounded-full object-cover object-center"
            />
            upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your Name"
            className="p-2 border border-gray-500 rounded-md
          focus:outline-none focus:ring-2 focus:violet-500"
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            placeholder="Your Bio"
            className="p-2 border border-gray-500 rounded-md
          focus:outline-none focus:ring-2 focus:violet-500"
          ></textarea>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-500 
            py-2 rounded-full text-white text-lg cursor-pointer"
          >
            Save
          </button>
        </form>
        <img
          src={authUser?.profilePic||assets.logo_icon}
          alt=""
          className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10${
            selectedImg && "rounded-full"
          }`}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
