import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useToast } from "../Context/ToastContext";

const Toast = ({ message, type }) => {
  useGSAP(() => {
    gsap.fromTo(
      ".toast-animation",
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
  }, []);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${
        type === "success" ? "bg-red-400" : "bg-red-500"
      } text-white toast-animation`}
    >
      <p>{message}</p>
    </div>
  );
};

const Login = ({
  data,
  setData,
  setLoggedIn,
  onSuccess,
  onSwitchToRegister,
}) => {
  const url = "https://midland-deploy.onrender.com";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill all the fields", "error");
      return;
    }
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data: response } = await axios.post(
        `${url}/api/auth/signin`,
        {
          email,
          password,
        },
        config
      );

      showToast("Login successful", "success");

      setData(response);
      localStorage.setItem("userInfo", response.token);
      localStorage.setItem("userData", JSON.stringify(response));
      setLoggedIn(true);

      if (onSuccess) onSuccess();

      navigate("/");
    } catch (error) {
      showToast(
        error.response?.data?.message || "An error occurred during login"
      );
    }
  };

  return (
    <div className="flex w-full items-center rounded-xl justify-center bg-gray-100">
      <div className="p-8 rounded-xl  w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
