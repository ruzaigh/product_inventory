// src/components/Layout/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold">
          Inventory & POS
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden md:block">
          {user ? `Welcome, ${user.username}` : 'Guest'}
        </span>
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center focus:outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
              {user ? user.username.charAt(0).toUpperCase() : 'G'}
            </div>
          </button>

          {/* Profile dropdown menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;