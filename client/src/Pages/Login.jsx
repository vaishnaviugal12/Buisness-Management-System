import React, { useState } from "react";
import { useNavigate } from "react-router";
import { User, Lock } from "lucide-react"; // Icons

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username && password) {
      try {
        // Server is configured to run on port 5000 (see server/.env). Update URL accordingly.
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: username,
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Save token (you can use localStorage or any state management)
          localStorage.setItem("token", data.token);
          setError(null);
          navigate("/select");

        } else {
          // Login failed, show error message
          setError(data.message || "Login failed");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      }
    } else {
      setError("Enter valid credentials");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-gray-200">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Username (Email)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-600 text-center font-semibold">{error}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition duration-300 shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
