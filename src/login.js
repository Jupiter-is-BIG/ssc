import React, { useState } from "react";
import { BE } from require('./BE/logic');

function Login() {
  const [cwl, setCWL] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Authentication logic
    console.log("CWL Username:", cwl);
    console.log("Password:", password);
    
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Blue Strip at the Top */}
      <div className="w-full h-20 bg-[#002145] flex justify-center items-center">
        <h1 className="text-white text-4xl font-bold">!SSC</h1>
      </div>

      {/* Login Form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white border border-gray-300 shadow-lg rounded-md">
          <h2 className="text-2xl font-bold text-center text-[#002145] mb-6">
            CWL Authentication
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[#002145] mb-2">Login Name:</label>
              <input
                type="text"
                value={cwl}
                onChange={(e) => setCWL(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-[#002145] mb-2">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#002145] text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-500"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center text-gray-600">
            <a href="#" className="text-[#002145] hover:underline">
              Can't login? Reach out to us!
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
