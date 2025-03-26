
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession, signOut } from '../utils/authUtils';

const Navbar = () => {
  const { user, isAdmin, isLoading } = useSession();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-xl text-harmony-600">
                CandidateHarmony
              </Link>
            </div>
            {user && !isLoading && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link 
                  to="/" 
                  className="border-harmony-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      {user.email}
                      {isAdmin && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-harmony-100 text-harmony-800">
                          Admin
                        </span>
                      )}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/auth" 
                    className="px-4 py-2 bg-harmony-500 text-white rounded-lg hover:bg-harmony-600 transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
