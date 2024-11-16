import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Image,
  Map,
  X,
  Bed,
  Bath,
  Home,
  ChefHat,
  Maximize,
  ShoppingCart,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useToast } from "../Context/ToastContext";

const PropertyDetails = ({ properties }) => {
  const url = "https://midland-deploy.onrender.com";
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [propertyData, setPropertyData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showPhotos, setShowPhotos] = useState(true);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (location.state && location.state.propertyData) {
      setPropertyData(location.state.propertyData);
    } else {
      const property = properties.find((p) => p._id === id);
      if (property) {
        setPropertyData(property);
      } else {
        navigate("/buy");
      }
    }
  }, [id, location, navigate, properties]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.subscription?.status === "active") {
      setHasSubscription(true);
    }
  }, []);

  useEffect(() => {
    const checkCartStatus = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData) return;

      try {
        const response = await axios.get(
          `${url}/api/properties/cart/${userData._id}`
        );
        setIsInCart(
          response.data.some((item) => item._id === propertyData._id)
        );
      } catch (error) {
        console.error("Error checking cart status:", error);
      }
    };

    if (propertyData) {
      checkCartStatus();
    }
  }, [propertyData]);

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("userData"));
    setUserData(storedUserData);
  }, []);

  if (!propertyData) {
    return <div>Loading...</div>;
  }

  const {
    name,
    location: propertyLocation,
    price,
    saleOrRent,
    images,
    address,
    ownerName,
    bhk,
    sqft,
    overview,
    amenities,
    details,
    locationMap,
    kitchen,
    bathroom,
  } = propertyData;

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderProtectedContent = (content) => {
    if (hasSubscription) {
      return content;
    }
    return (
      <div className="relative group">
        <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-lg">
          <h3 className="text-red-500 font-semibold text-xl mb-2">
            Subscribe to View
          </h3>
          <p className="text-gray-700 text-sm mb-3">
            Subscribe to view complete details
          </p>
          <button
            onClick={() => navigate("/pricing")}
            className="text-white bg-red-500 px-6 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-all duration-300"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (activeTab === "overview") {
      return renderProtectedContent(
        <p className="text-gray-700">{overview}</p>
      );
    } else if (activeTab === "details") {
      return renderProtectedContent(
        <div>
          <p>BHK: {bhk}</p>
          <p>Sqft: {sqft}</p>
          <p>Owner: {ownerName}</p>
          {details && <p>{details}</p>}
        </div>
      );
    } else if (activeTab === "amenities") {
      return renderProtectedContent(
        <ul className="list-disc list-inside">
          {amenities.map((amenity, index) => (
            <li key={index} className="text-gray-700">
              {amenity}
            </li>
          ))}
        </ul>
      );
    }
    return null;
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleAddToCart = async () => {
    if (!userData) {
      showToast("Please login to add items to cart");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${url}/api/properties/cart/add`, {
        userId: userData._id,
        propertyId: propertyData._id,
      });
      setIsInCart(true);
      showToast("Property added to cart!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Error adding to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!userData) {
      showToast("Please login to contact the agent");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${url}/api/contacts`, {
        ...contactForm,
        propertyId: propertyData._id,
        userId: userData?._id,
      });
      setShowContactForm(false);
      showToast("Message sent successfully!", "success");
    } catch (error) {
      showToast("Error sending message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: name,
    description: overview,
    price: price,
    address: {
      "@type": "PostalAddress",
      addressLocality: address,
      addressRegion: "Andhra Pradesh",
      addressCountry: "IN",
    },
  };

  return (
    <>
      <Helmet>
        <title>{name} | Midland Real Estate</title>
        <meta
          name="description"
          content={`${bhk} BHK ${saleOrRent} for ${price.toLocaleString()} in ${address}. ${overview}`}
        />
        <meta
          name="keywords"
          content={`${bhk} BHK, ${saleOrRent}, ${price.toLocaleString()}, ${address}, ${overview}`}
        />
        <meta property="og:title" content={`${name} | Midland Real Estate`} />
        <meta
          property="og:description"
          content={`${bhk} BHK ${saleOrRent} for ${price.toLocaleString()} in ${address}`}
        />
        <meta property="og:image" content={images[0]} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <div className="cursor-auto select-none font-['Onest',sans-serif]">
        {showAddedToCart && (
          <div className="fixed top-24 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
            Added to cart successfully!
          </div>
        )}
        <div className="w-full overflow-y-auto mt-20 h-full p-4 rounded-2xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-1 flex items-center text-red-600 hover:underline"
          >
            <ChevronLeft className="mr-2" />
            <div className="px-2 py-1 rounded-md bg-red-600 text-white">
              Back
            </div>
          </button>
          <div className="rounded-lg p-3">
            <div className="flex justify-center space-x-4 mb-6">
              <button
                className={`flex items-center px-4 py-2 rounded-full ${
                  showPhotos
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setShowPhotos(true)}
              >
                <Image className="mr-2" /> Photos
              </button>
              <button
                className={`flex items-center px-4 py-2 rounded-full ${
                  !showPhotos
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setShowPhotos(false)}
              >
                <Map className="mr-2" /> Map
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="relative mb-6 rounded-xl w-full h-[400px] md:h-[calc(100vh-300px)]">
                  {showPhotos ? (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={`${name} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover rounded-lg shadow-md cursor-pointer"
                        onClick={toggleFullScreen}
                      />
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-500 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-300"
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-300"
                      >
                        <ChevronRight />
                      </button>
                    </>
                  ) : (
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3896.4200262163104!2d80.62001967522313!3d16.441925684292904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35f0a2a7d81943%3A0x8ba5d78f65df94b8!2sK%20L%20E%20F%20Deemed%20To%20Be%20University!5e1!3m2!1sen!2sin!4v1729451108838!5m2!1sen!2sin"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="eager"
                      className="rounded-xl h-[400px]  md:h-[calc(100vh-240px)]"
                    ></iframe>
                  )}
                </div>
                {showPhotos && (
                  <div className="flex space-x-4 mb-6 ">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${name} - Image ${index + 1}`}
                        className={`w-24 h-24 object-cover rounded-xl cursor-pointer transition-all duration-300 ${
                          index === currentImageIndex
                            ? "border-2 border-red-500 scale-105"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2 md:mb-0 text-gray-800">
                    {name}
                  </h2>
                  <p className="text-2xl md:text-3xl text-red-600 font-bold">
                    ₹{price.toLocaleString()}
                    {saleOrRent === "rent" ? "/month" : ""}
                  </p>
                </div>
                <p className="text-gray-600 flex items-center mb-6">
                  <MapPin className="mr-2" /> {address}
                </p>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">
                    Property Details:
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center">
                      <Bed className="mr-2 text-red-600" />
                      <span>{bhk} Bedrooms</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="mr-2 text-red-600" />
                      <span>{bathroom} Bathrooms</span>
                    </div>
                    <div className="flex items-center">
                      <ChefHat className="mr-2 text-red-600" />
                      <span>{kitchen} Kitchen</span>
                    </div>
                    <div className="flex items-center">
                      <Maximize className="mr-2 text-red-600" />
                      <span>{sqft} sqft</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex space-x-6 mb-4 border-b border-gray-200">
                    {["overview", "details", "amenities"].map((tab) => (
                      <div key={tab} className="relative">
                        <span
                          className={`text-lg font-medium cursor-pointer pb-2 ${
                            activeTab === tab
                              ? "text-red-600 border-b-2 border-red-600"
                              : "text-gray-600 hover:text-red-500"
                          }`}
                          onClick={() => handleTabChange(tab)}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          {!hasSubscription && (
                            <span className="ml-2 text-red-500 text-xs">
                              PRO
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="h-[200px] overflow-y-auto transition-all duration-300 ease-in-out mb-6">
                    {renderTabContent()}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="px-6 py-3 bg-white text-gray-800 border-2 border-gray-200 rounded-full hover:bg-gray-100 hover:border-gray-300 transition-colors duration-300"
                    >
                      Contact Agent
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={loading || isInCart}
                      className={`px-8 py-3 flex items-center justify-center gap-2 rounded-full transition-colors duration-300 ${
                        isInCart
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-red-500 hover:bg-red-600"
                      } text-white`}
                    >
                      <ShoppingCart size={20} />
                      {isInCart ? "In Cart" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {isFullScreen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={toggleFullScreen}
          >
            <div
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[currentImageIndex]}
                alt={`${name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain rounded-2xl"
              />
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-500 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-300"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-500 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-300"
              >
                <ChevronRight />
              </button>
              <button
                onClick={toggleFullScreen}
                className="absolute top-4 right-4 text-white bg-red-600 rounded-full p-2"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        )}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Contact Agent</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-300 h-32"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyDetails;
