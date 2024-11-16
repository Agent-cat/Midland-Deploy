import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Camera, Loader, Building, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../Context/ToastContext";

const Profile = ({ data, setData }) => {
  const url = "https://midland-deploy.onrender.com";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userProperties, setUserProperties] = useState([]);
  const [formData, setFormData] = useState({
    username: data?.name || "",
    email: data?.email || "",
    phno: data?.phno || "",
    profilePicture: data?.pic || "",
    location: data?.location || "",
  });
  const { showToast } = useToast();

  useEffect(() => {
    if (!data) {
      navigate("/login");
    } else {
      //fetchUserProperties();
    }
  }, [data, navigate]);

  const fetchUserProperties = async () => {
    try {
      const response = await axios.get(`${url}/api/properties/`);
      setUserProperties(
        response.data.filter((prop) => prop.ownerName === data.name)
      );
    } catch (error) {
      showToast("Error fetching your properties");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "midland");
      formData.append("cloud_name", "vishnu2005");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/vishnu2005/image/upload",
        formData
      );
      setFormData({ ...formData, profilePicture: response.data.secure_url });
    } catch (error) {
      showToast("Error uploading image. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        `${url}/api/auth/update/${data._id}`,
        formData
      );
      setData(response.data);
      localStorage.setItem("userData", JSON.stringify(response.data));
      setEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16 pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative h-32 ">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <img
                      src={formData.profilePicture || "/default-avatar.png"}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-white object-cover"
                    />
                    {editing && (
                      <label className="absolute bottom-0 right-0 bg-red-500 p-1.5 rounded-full cursor-pointer hover:bg-red-600 transition-colors">
                        <Camera size={16} className="text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-16 px-6 pb-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="text-center w-full border-b border-gray-300 focus:border-red-400 focus:outline-none"
                      />
                    ) : (
                      formData.username
                    )}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Member since{" "}
                    {new Date(data?.createdAt).getFullYear() || "2024"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Mail size={18} className="mr-3" />
                    {editing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="flex-1 border-b border-gray-300 focus:border-red-400 focus:outline-none"
                      />
                    ) : (
                      <span>{formData.email}</span>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone size={18} className="mr-3" />
                    {editing ? (
                      <input
                        type="tel"
                        name="phno"
                        value={formData.phno}
                        onChange={handleInputChange}
                        className="flex-1 border-b border-gray-300 focus:border-red-400 focus:outline-none"
                      />
                    ) : (
                      <span>{formData.phno}</span>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-3" />
                    {editing ? (
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="flex-1 border-b border-gray-300 focus:border-red-400 focus:outline-none"
                        placeholder="Your location"
                      />
                    ) : (
                      <span>{formData.location || "Location not set"}</span>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditing(false)}
                        className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        {loading ? (
                          <Loader className="animate-spin mx-auto" size={20} />
                        ) : (
                          "Save"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Properties Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  My Properties
                </h3>
                <Building size={24} className="text-red-500" />
              </div>

              {userProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>You haven't listed any properties yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProperties.map((property) => (
                    <div
                      key={property._id}
                      className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-lg mb-2">
                          {property.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">
                          <MapPin size={16} className="inline mr-1" />
                          {property.location}
                        </p>
                        <p className="text-red-500 font-bold">
                          ₹{property.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">My Listed Properties</h2>
        {/* <ListedProperties userId={data._id} /> */}
      </div>
    </div>
  );
};

export default Profile;
