import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { Navlinks } from "../Constants/Constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Menu, X, UserCircle, LogOut, ShoppingCart } from "lucide-react";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import Cart from "./Cart";
import midlandLogo from "../assets/midland.png";

const Navbar = ({ data, setData, loggedIn, setLoggedIn }) => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navbarRef = useRef(null);
  const menuRef = useRef(null);
  const menuItemsRef = useRef([]);
  const popupRef = useRef(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  useGSAP(() => {
    const activeLink = document.querySelector(".nav-links .text-red-500");
    const underline = document.querySelector(".nav-underline");
    if (activeLink && underline) {
      gsap.to(underline, {
        width: activeLink.offsetWidth,
        x: activeLink.offsetLeft,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [location]);

  useEffect(() => {
    if (menuRef.current) {
      gsap.to(menuRef.current, {
        x: isMenuOpen ? "0%" : "100%",
        duration: 0.5,
        ease: "power3.inOut",
      });

      if (isMenuOpen) {
        gsap.fromTo(
          menuItemsRef.current,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.2,
          }
        );
      }
    }
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const openRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("userInfo");
    const userData = localStorage.getItem("userData");
    if (token && userData) {
      setLoggedIn(true);
      setData(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userData");
    setLoggedIn(false);
    setData(null);
    setShowUserMenu(false);
    navigate("/");
  };

  const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className="bg-gray-100 rounded-lg p-6 w-full max-w-md relative transform transition-all duration-300 ease-in-out"
          style={{
            animation: "modalFade 0.3s ease-out",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 hover:scale-105 transition-transform duration-200"
          >
            <X size={24} color="red" />
          </button>
          {children}
        </div>
      </div>
    );
  };

  // Function to switch between modals
  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  return (
    <>
      <nav
        ref={navbarRef}
        className={`flex py-6 cursor-auto md:py-0 select-none rounded-2xl m-2 font-semibold bg-[#d5dbde] text-md font-['Onest',sans-serif] justify-between items-center fixed top-0 left-0 overflow-visible right-0 z-50 transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Link
          to="/"
          className="md:ml-4 flex items-center gap-2 text-red-400 ml-8 md:text-gray-700 text-2xl font-bold"
        >
          <img
            src={midlandLogo}
            alt="Midland Logo"
            className="w-20 md:w-16 h-12 md:h-20 rounded-xl"
          />
          <div>
            <h1 className="hidden lg:inline text-gray-700">Midland</h1>
            <span className="text-red-400 hidden lg:inline">Real-Estate</span>
          </div>
        </Link>
        <div className="hidden md:flex gap-8 relative nav-links">
          {Navlinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.link}
              className={({ isActive }) =>
                `hover:text-red-500 hover:-translate-y-1 transition-all duration-300 py-6 hover:font-bold font-semibold text-gray-700 ${
                  isActive ? "text-red-500 font-bold" : ""
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <div className="absolute bottom-0 h-0.5 bg-red-500 nav-underline" />
        </div>
        <div className="hidden md:flex mt-2 h-full mr-9 gap-4">
          {loggedIn && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-md  transition-colors duration-300"
            >
              <ShoppingCart color="red" size={25} />
            </button>
          )}
          {loggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-4 px-3 py-2 text-gray-700 rounded-lg  transition-all duration-300"
              >
                {data?.pic ? (
                  <img
                    src={data.pic}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2  transition-all duration-300 shadow-md"
                  />
                ) : (
                  <UserCircle size={32} className="text-gray-600" />
                )}
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-md font-['Onest',sans-serif] text-gray-900">
                    {data?.name}
                  </span>
                  <span className="text-xs text-gray-500">{data?.email}</span>
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    <UserCircle size={16} className="mr-3" />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-gray-50 transition-all duration-200"
                  >
                    <LogOut size={16} className="mr-3" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-red-400 text-white rounded-md hover:bg-red-500 transition-colors duration-300"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors duration-300"
              >
                Register
              </button>
            </>
          )}
        </div>

        <button onClick={toggleMenu} className="md:hidden mr-4">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <div
        ref={menuRef}
        className="fixed top-0 right-0 w-full h-full bg-[#d5dbde] z-40 transform translate-x-full"
      >
        <div className="flex flex-col items-center justify-center h-full">
          {Navlinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.link}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `text-3xl mb-8 hover:text-red-500 transition-all duration-300 ${
                  isActive ? "text-red-500 font-bold" : "text-gray-700"
                }`
              }
              ref={(el) => (menuItemsRef.current[index] = el)}
            >
              {link.name}
            </NavLink>
          ))}
          <div className="flex flex-row gap-6 mt-8">
            {loggedIn ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-3 px-6 py-4">
                  {data?.pic ? (
                    <img
                      src={data.pic}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-3 border-red-400 shadow-lg"
                    />
                  ) : (
                    <UserCircle size={48} className="text-gray-600" />
                  )}
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xl text-gray-800">
                      {data?.name}
                    </span>
                    <span className="text-sm text-gray-500">Member</span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-300"
                >
                  <UserCircle size={18} className="mr-2" />
                  <span className="font-medium">Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-6 py-2 text-red-500 hover:text-red-600 transition-colors duration-300"
                >
                  <LogOut size={18} className="mr-2" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="px-8 py-3 bg-red-400 text-white text-xl rounded-md hover:bg-red-500 transition-colors duration-300"
                  ref={(el) => (menuItemsRef.current[Navlinks.length] = el)}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowRegisterModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="px-8 py-3 bg-gray-400 text-white text-xl rounded-md hover:bg-gray-500 transition-colors duration-300"
                  ref={(el) => (menuItemsRef.current[Navlinks.length + 1] = el)}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {!loggedIn && (showLogin || showRegister) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={popupRef} className="rounded-lg relative">
            <Link
              to="/"
              onClick={() => {
                setShowLogin(false);
                setShowRegister(false);
              }}
              className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-300 shadow-lg"
            >
              <X size={20} />
            </Link>
            <LoginRoutes
              data={data}
              setData={setData}
              loggedIn={loggedIn}
              setLoggedIn={setLoggedIn}
            />
          </div>
        </div>
      )}

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login"
      >
        <Login
          data={data}
          setData={setData}
          setLoggedIn={setLoggedIn}
          onSuccess={() => setShowLoginModal(false)}
          onSwitchToRegister={switchToRegister}
        />
      </Modal>

      {/* Register Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Register"
      >
        <Register
          onSuccess={() => {
            setShowRegisterModal(false);
            setShowLoginModal(true);
          }}
          onSwitchToLogin={switchToLogin}
        />
      </Modal>
    </>
  );
};

export default Navbar;
