import React, { useEffect, useState } from "react";
import Lenis from "@studio-freight/lenis";
import Navbar from "./Components/Navbar";
import Navroutes from "./Routes/Navroutes";
import axios from "axios";
import { HelmetProvider } from "react-helmet-async";
import { ToastProvider } from "./Context/ToastContext";

const App = () => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("userData");
    return savedData ? JSON.parse(savedData) : null;
  });
  const [loggedIn, setLoggedIn] = useState(() => {
    return !!localStorage.getItem("userInfo");
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/properties");
      if (response.data) {
        setProperties(
          response.data.map((property) => ({
            ...property,
            id: property._id || property.id, // Ensure id exists by using _id or id
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: true,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ToastProvider>
      <HelmetProvider>
        <div className="select-none font-['Onest',sans-serif]">
          <Navbar
            data={data}
            setData={setData}
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
          />
          <Navroutes
            data={data}
            setData={setData}
            loggedIn={loggedIn}
            properties={properties}
            loading={loading}
            refreshProperties={fetchProperties}
          />
        </div>
      </HelmetProvider>
    </ToastProvider>
  );
};

export default App;
