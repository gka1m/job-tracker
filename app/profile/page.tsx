"use client";

import React from "react";
import Navbar from "../components/Navbar";
import EditProfile from "../components/EditProfile";

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center items-center">
        <EditProfile />
      </div>
    </div>
  );
};

export default Profile;
