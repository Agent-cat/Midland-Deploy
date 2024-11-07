import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

const Register = ({ onSuccess, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phno, setPhno] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const { showToast } = useToast();

  const CLOUDINARY_API_KEY = "312718115279244";
  const CLOUDINARY_API_SECRET = "voYe5Ddk4KoVI65lIT6DZ_X10zs";

  const upload = async (pics) => {
    try {
      setLoading(true);
      if (!pics) {
        showToast("Please Upload a Picture");
        return;
      }

      if (pics.type === "image/jpeg" || pics.type === "image/png") {
        const data = new FormData();
        data.append("file", pics);
        data.append("upload_preset", "midland");
        data.append("cloud_name", "vishnu2005");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/vishnu2005/image/upload",
          data
        );
        setProfilePicture(response.data.url);
        showToast("Image uploaded successfully!", "success");
      } else {
        showToast("Please upload a JPEG or PNG file");
      }
    } catch (error) {
      showToast("Error uploading image");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      showToast("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/signup",
        {
          username,
          email,
          password,
          phno,
          profilePicture,
        }
      );
      showToast("Registration successful!", "success");
      onSuccess();
    } catch (error) {
      showToast(error.response?.data?.message || "Registration failed");
    }
  };

  if (loggedIn) {
    return null;
  }

  return (
    <div className="flex w-full items-center rounded-xl justify-center bg-gray-100">
      {toast.show && <Toast message={toast.message} type={toast.type} />}
      <div className="p-8 rounded-xl  w-full">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Register
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="shadow appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              className="shadow appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="phno"
            >
              Phone Number
            </label>
            <input
              className="shadow appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="phno"
              type="tel"
              placeholder="Phone Number"
              onChange={(e) => setPhno(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="profilePicture"
            >
              Profile Picture
            </label>
            <input
              className="shadow appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={(e) => upload(e.target.files[0])}
            />
          </div>
          <div className="flex items-center ju w-full">
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
