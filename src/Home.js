import React, { useState } from "react";
import Subjects from "./Subjects";

function Home() {
  const [campus, setCampus] = useState("ubco");
  const [session, setSession] = useState("winter");
  const handleCampusChange = (event) => {
    setCampus(event.target.value);
  };
  const handleSessionChange = (event) => {
    setSession(event.target.value);
  };
  return (
    <div>
      <div className="w-full h-20 bg-[#002145] flex justify-center items-center">
        <h1 className="text-white text-4xl font-bold">!SSC</h1>
      </div>

      <div className="flex justify-end items-center space-x-2 pr-8 pt-4">
        <select
          className="p-2 border bg-[#002145] border-gray-300 rounded-md text-[#fdfdfd] font-semibold"
          onChange={handleCampusChange}
          value={campus}
        >
          <option value="ubcv">Campus: UBC Vancouver</option>
          <option value="ubco">Campus: UBC Okanagan</option>
        </select>
        <select
          className="p-2 border bg-[#002145] border-gray-300 rounded-md text-[#ffffff] font-semibold"
          onChange={handleSessionChange}
          value={session}
        >
          <option value="winter">Session: 2024-25 Winter</option>
          <option value="summer">Session: 2025 Summer</option>
        </select>
      </div>

      <Subjects campus={campus} session={session} />
    </div>
  );
}

export default Home;
