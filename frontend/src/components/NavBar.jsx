import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { showSuccessAlert, showConfirmAlert } from "../services/alerts";
import axios from "axios";

export default function NavBar() {
  const [username, setUsername] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: token },
        });
        setUsername(res.data.username);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const logout = async () => {
    const result = await showConfirmAlert(
      "Logout",
      "Are you sure you want to logout?",
      "Yes, logout it!"
    );
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      showSuccessAlert("Goodbye!", "You have been logged out successfully");
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-900 dark:bg-blue-800 shadow-lg border-b border-blue-700 dark:border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-bold text-white">TaskApp</h1>
          </div>

          {/* Desktop Navigation*/}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {username && (
              <span className="text-white font-medium text-sm lg:text-base">
                Hi, {username}
              </span>
            )}

            <ThemeToggle />

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-2 lg:px-4 lg:py-2 text-sm font-medium rounded-md transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-blue-200 focus:outline-none focus:text-blue-200 p-2"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-800 dark:bg-blue-900 border-t border-blue-700 dark:border-blue-600">
            <div className="px-2 pt-2 pb-3 space-y-3">
              {username && (
                <div className="text-white font-medium text-sm px-3 py-2">
                  Hi, {username}
                </div>
              )}

              <div className="px-3 py-2">
                <ThemeToggle />
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
