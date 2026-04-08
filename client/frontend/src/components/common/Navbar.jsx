import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faSignOutAlt, faHome, faBook, faChartBar, faClipboardList, faTrophy, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { gsap } from 'gsap';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const navbarRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef([]);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    // أنيميشن دخول النافبار
    const tl = gsap.timeline();

    gsap.set(navbarRef.current, {
      opacity: 0,
      y: -100,
      filter: 'blur(10px)'
    });

    gsap.set(logoRef.current, {
      opacity: 0,
      x: -50,
      scale: 0.5
    });

    tl.to(navbarRef.current, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
    })
      .to(logoRef.current, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.7)',
      }, '-=0.4');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      setIsScrolled(scrollY > 50);
      setIsCollapsed(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    setShowProfile(false);
  };

  return (
    <nav
      className={`navbar ${isCollapsed ? 'collapsed' : ''} ${isScrolled ? 'scrolled' : ''}`}
      ref={navbarRef}
    >
      <div className="navbar-container">
        {/* الشعار */}
        <a
          href="/"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          ref={logoRef}
        >
          <span className="logo-text">NCTU</span>
          <span className="logo-accent">System</span>
        </a>

        {/* روابط التنقل */}
        <div className={`nav-user-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-menu-items">
            {/* الرئيسية */}
            <button
              className="nav-menu-item"
              onClick={() => handleNavigation('/')}
            >
              <FontAwesomeIcon icon={faHome} />
              الرئيسية
            </button>
            {/* المواد الدراسية */}
            <button
              className="nav-menu-item"
              onClick={() => handleNavigation('/portal')}
            >
              <FontAwesomeIcon icon={faBook} />
              المواد
            </button>
            {/* الدرجات */}
            <button
              className="nav-menu-item"
              onClick={() => handleNavigation('/grades')}
            >
              <FontAwesomeIcon icon={faClipboardList} />
              الدرجات
            </button>
            {/* التقارير */}
            <button
              className="nav-menu-item"
              onClick={() => handleNavigation('/dashboard')}
            >
              <FontAwesomeIcon icon={faChartBar} />
              التقارير
            </button>

            {/* لوحة التحكم (للإدمن فقط) - Dropdown */}
            {user?.role === 'admin' && (
              <div className="admin-dropdown-wrapper">
                <button
                  className="nav-menu-item admin"
                  onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                  onMouseEnter={() => setShowAdminDropdown(true)}
                >
                  <FontAwesomeIcon icon={faChartBar} />
                  الإدارة
                  <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '12px' }} />
                </button>
                
                {showAdminDropdown && (
                  <div 
                    className="admin-dropdown-menu"
                    onMouseLeave={() => setShowAdminDropdown(false)}
                  >
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleNavigation('/admin/dashboard');
                        setShowAdminDropdown(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                      لوحة التحكم
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleNavigation('/admin/courses');
                        setShowAdminDropdown(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faBook} />
                      الدورات
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleNavigation('/admin/professors');
                        setShowAdminDropdown(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                      الأساتذة
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleNavigation('/admin/schedules');
                        setShowAdminDropdown(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                      الجداول
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleNavigation('/admin/grade-settings');
                        setShowAdminDropdown(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                      إعدادات الدرجات
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleNavigation('/admin/pending-grades');
                        setShowAdminDropdown(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faClipboardList} />
                      الدرجات المعلقة
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleNavigation('/admin/qr-code');
                        setShowAdminDropdown(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                      QR Codes
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        handleNavigation('/admin/timetables');
                        setShowAdminDropdown(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                      الجداول الزمنية
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* الملف الشخصي */}
            {user ? (
              <div className="profile-menu">
                <button
                  className="nav-menu-item profile-btn"
                  onClick={() => setShowProfile(!showProfile)}
                >
                  <div className="avatar">
                    {user?.profile_picture ? (
                      <img src={user.profile_picture} alt={user.full_name} />
                    ) : (
                      <span>{user?.full_name?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span>{user?.full_name}</span>
                </button>

                {/* قائمة الملف الشخصي */}
                {showProfile && (
                  <div className="profile-dropdown">
                    <div className="profile-info">
                      <p className="profile-name">{user?.full_name}</p>
                      <p className="profile-email">{user?.email}</p>
                      <p className="profile-role">
                        {user?.role === 'admin' && '👨‍💼 مسؤول'}
                        {user?.role === 'professor' && '👨‍🏫 أستاذ'}
                        {user?.role === 'student' && '👤 طالب'}
                        {user?.role === 'accountant' && '💼 محاسب'}
                        {user?.role === 'registrar' && '📋 مسجل'}
                      </p>
                    </div>
                    <div className="profile-actions">
                      <button
                        className="action-btn logout"
                        onClick={handleLogout}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="nav-menu-item login-btn"
                onClick={() => navigate('/login')}
              >
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        </div>

        {/* زر القائمة */}
        <button
          className={`hamburger ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          ref={hamburgerRef}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <FontAwesomeIcon icon={faTimes} className="hamburger-icon" />
          ) : (
            <FontAwesomeIcon icon={faBars} className="hamburger-icon" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;