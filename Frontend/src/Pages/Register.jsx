import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const Toast = ({ message, type }) => {
  useGSAP(() => {
    gsap.fromTo(
      ".toast-animation",
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.5 }
    );
  }, []);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${bgColor} text-white toast-animation max-w-md`}
    >
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phno, setPhno] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const CLOUDINARY_API_KEY = "312718115279244";
  const CLOUDINARY_API_SECRET = "voYe5Ddk4KoVI65lIT6DZ_X10zs";

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 2000);
  };

  const upload = async (pics) => {
    try {
      setLoading(true);
      if (!pics) {
        showToast("Please Upload a Picture", "error");
        return;
      }

      if (pics.type === "image/jpeg" || pics.type === "image/png") {
        const data = new FormData();
        data.append("file", pics);
        data.append("upload_preset", "midland");
        data.append("cloud_name", "vishnu2005");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/vishnu2005/image/upload",
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data && response.data.url) {
          setProfilePicture(response.data.url.toString());
        } else {
          throw new Error("Invalid response from Cloudinary");
        }
      } else {
        showToast("Please Upload a JPEG or PNG image", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to upload image", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!username || !email || !password || !phno) {
      showToast("Please fill all required fields", "error");
      return false;
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address", "error");
      return false;
    }

    // Password validation
    if (password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return false;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phno)) {
      showToast("Phone number must be 10 digits", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      await axios.post(
        "http://localhost:4000/api/auth/signup",
        {
          username,
          email,
          password,
          phno,
          profilePicture,
        },
        config
      );

      setShowSuccessModal(true);
    } catch (error) {
      // Get the error message from the response
      const errorResponse = error.response?.data;
      let errorMessage = "Registration failed";

      if (errorResponse?.error) {
        errorMessage = errorResponse.error;

        // Handle specific field errors
        if (errorResponse.field) {
          switch (errorResponse.field) {
            case "username":
              setUsername(""); // Clear username field
              break;
            case "email":
              setEmail(""); // Clear email field
              break;
            case "phno":
              setPhno(""); // Clear phone number field
              break;
          }
        }
      }

      showToast(errorMessage, "error");
      console.error("Registration error:", errorResponse || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn) {
    return null;
  }

  return (
    <div className=" flex items-center rounded-xl justify-center bg-gray-100">
      {toast.show && <Toast message={toast.message} type={toast.type} />}
      <div className=" p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold  mb-6 text-center text-gray-800">
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
          <Link to="/login" className="text-red-500 hover:text-red-700">
            Login here
          </Link>
        </p>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Registration Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. Please login to
              continue.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/login"
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Login Now
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Register;
