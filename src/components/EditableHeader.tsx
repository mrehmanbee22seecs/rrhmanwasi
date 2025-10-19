import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, LogIn, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../hooks/useContent';
import AdminPanel from './AdminPanel';
import ContentEditor from './ContentEditor';
import EditButton from './EditButton';
import AuthModal from './AuthModal';

const EditableHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { currentUser, userData, isGuest, isAdmin, logout } = useAuth();

  const { data: headerData, upsertContent: saveHeader } = useContent('header_content', 'main');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultHeader = {
    arabicName: 'وسیلہ',
    englishName: 'Wasilah',
    logoUrl: '/logo.jpeg'
  };

  const header = headerData || defaultHeader;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'About Us', href: '/about' },
    { name: 'Projects', href: '/projects' },
    { name: 'Events', href: '/events' },
    { name: 'Join Us', href: '/volunteer' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled
          ? 'bg-gray-900/95 shadow-luxury-lg backdrop-blur-luxury'
          : 'bg-gray-900/90'
      }`}>
        {isAdmin && (
          <EditButton onClick={() => setEditingSection('header')} />
        )}

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 group">
              <div className="transform transition-transform duration-500 group-hover:scale-110">
                <img
                  src={header.logoUrl}
                  alt="Wasilah Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-cover rounded-xl sm:rounded-2xl shadow-luxury-glow"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm lg:text-lg font-arabic text-white leading-tight">
                  {header.arabicName}
                </span>
                <span className="text-lg sm:text-xl lg:text-2xl font-luxury-heading text-white group-hover:text-vibrant-orange-light transition-colors duration-300">
                  {header.englishName}
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-2">
              {navigation.map((item) => (
                (item.name === 'Dashboard' && (isGuest || !currentUser)) ? null : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-pill ${
                      location.pathname === item.href ? 'active' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            <div className="hidden lg:block relative">
              {currentUser && !isGuest ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-3 rounded-luxury hover:bg-logo-navy-light/60 transition-colors"
                  >
                    {userData?.photoURL ? (
                      <img
                        src={userData.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-vibrant-orange"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-vibrant-orange rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-cream-elegant font-luxury-semibold text-sm">
                        {userData?.displayName || 'User'}
                      </p>
                      {isAdmin && (
                        <p className="text-vibrant-orange-light text-xs">Admin</p>
                      )}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 luxury-glass-dark rounded-luxury-lg border-2 border-vibrant-orange/30 py-2">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setShowAdminPanel(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-cream-elegant hover:bg-vibrant-orange/20 transition-colors flex items-center"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Admin Panel
                        </button>
                      )}
                      <Link
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full text-left px-4 py-2 text-cream-elegant hover:bg-vibrant-orange/20 transition-colors flex items-center"
                      >
                        <User className="w-4 h-4 mr-3" />
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-cream-elegant hover:bg-vibrant-orange/20 transition-colors flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : isGuest ? (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-vibrant-orange text-white rounded-luxury hover:bg-vibrant-orange-light transition-colors font-luxury-semibold"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              ) : null}
            </div>

            <div className="flex lg:hidden items-center gap-2">
              {currentUser && !isGuest && (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="relative p-2.5 text-white hover:text-vibrant-orange-light transition-colors active:scale-95 transform duration-200"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-lg text-white hover:bg-gray-700 transition-all duration-300 active:scale-95 transform"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden animate-fade-in-down">
              <div className="px-4 pt-4 pb-6 space-y-2 bg-gray-800 rounded-2xl mt-4 border border-gray-700 shadow-2xl">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-5 py-3.5 rounded-xl text-base font-bold transition-all duration-300 transform active:scale-95 ${
                      location.pathname === item.href
                        ? 'text-gray-900 bg-white shadow-md'
                        : 'text-white hover:text-vibrant-orange-light hover:bg-gray-700 hover:translate-x-2'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.name}
                  </Link>
                ))}
                {!currentUser && !isGuest && (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-vibrant-orange to-vibrant-orange-light text-white rounded-xl hover:shadow-lg transition-all duration-300 font-bold active:scale-95 transform"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>

        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
        />
      </header>

      <ContentEditor
        isOpen={editingSection === 'header'}
        onClose={() => setEditingSection(null)}
        title="Edit Header"
        fields={[
          { name: 'arabicName', label: 'Arabic Name', type: 'text', required: true },
          { name: 'englishName', label: 'English Name', type: 'text', required: true },
          { name: 'logoUrl', label: 'Logo Image URL', type: 'text', required: true }
        ]}
        initialData={header}
        onSave={(data) => saveHeader('main', data)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default EditableHeader;
