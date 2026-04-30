import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faSignOutAlt, faHome, faInfoCircle, faEnvelope, faCogs, faChartBar } from '@fortawesome/free-solid-svg-icons';
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
    const navbarRef = useRef(null);
    const logoRef = useRef(null);
    const hamburgerRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline();
        gsap.set(navbarRef.current, { opacity: 0, y: -100, filter: 'blur(10px)' });
        gsap.set(logoRef.current, { opacity: 0, x: -50, scale: 0.5 });
        tl.to(navbarRef.current, {
            opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'elastic.out(1, 0.5)',
        }).to(logoRef.current, {
            opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)',
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showProfile && !event.target.closest('.profile-menu')) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfile]);

    const handleLogout = () => { logout(); navigate('/'); };
    const handleNavigation = (path) => { navigate(path); setIsMenuOpen(false); setShowProfile(false); };

    return (
        <nav
            className={`navbar ${isCollapsed ? 'collapsed' : ''} ${isScrolled ? 'scrolled' : ''}`}
            ref={navbarRef}
        >
            <div className="navbar-container">
                <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigate('/'); }} ref={logoRef}>
                    <span className="logo-text">NCTU</span>
                </a>

                <div className={`nav-user-menu ${isMenuOpen ? 'open' : ''}`}>
                    <div className="nav-menu-items">
                        <button className="nav-menu-item" onClick={() => handleNavigation('/')}>
                            <FontAwesomeIcon icon={faHome} />Home
                        </button>
                        <button className="nav-menu-item" onClick={() => handleNavigation('/about')}>
                            <FontAwesomeIcon icon={faInfoCircle} />About
                        </button>
                        <button className="nav-menu-item" onClick={() => handleNavigation('/contact')}>
                            <FontAwesomeIcon icon={faEnvelope} />Contact
                        </button>
                        <button className="nav-menu-item" onClick={() => handleNavigation('/services')}>
                            <FontAwesomeIcon icon={faCogs} />Services
                        </button>

                        {user?.role === 'admin' && (
                            <button className="nav-menu-item admin" onClick={() => handleNavigation('/admin/dashboard')}>
                                <FontAwesomeIcon icon={faChartBar} />Dashboard
                            </button>
                        )}

                        {user?.role === 'professor' && (
                            <button className="nav-menu-item" style={{ color: 'var(--purple-light)' }} onClick={() => handleNavigation('/professor/dashboard')}>
                                <FontAwesomeIcon icon={faChartBar} />لوحة التحكم
                            </button>
                        )}

                        {user?.role === 'accountant' && (
                            <button className="nav-menu-item accountant" onClick={() => handleNavigation('/accountant/dashboard')}>
                                <FontAwesomeIcon icon={faChartBar} />لوحة المحاسب
                            </button>
                        )}

                        {user?.role === 'student' && (
                            <button className="nav-menu-item student" onClick={() => handleNavigation('/student/my-data')}>
                                <FontAwesomeIcon icon={faChartBar} />بياناتي
                            </button>
                        )}

                        {user && (
                            <div className="profile-menu">
                                <button className="nav-menu-item profile-btn" onClick={() => setShowProfile(!showProfile)}>
                                    <div className="avatar">
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.full_name || user.username} />
                                        ) : (
                                            <span>{(user?.full_name || user?.username)?.[0]?.toUpperCase() || 'U'}</span>
                                        )}
                                    </div>
                                    <span>{user?.full_name || user?.username || 'Guest'}</span>
                                </button>

                                {showProfile && (
                                    <div className="profile-dropdown">
                                        <div className="profile-info">
                                            <p className="profile-name">{user?.full_name || user?.username || 'Guest'}</p>
                                            <p className="profile-email">{user?.email || ''}</p>
                                            <p className="profile-role">
                                                {user?.role === 'admin' ? '👨‍💼 مسؤول' : 
                                                 user?.role === 'student' ? '🎓 طالب' :
                                                 user?.role === 'professor' ? '👨‍🏫 دكتور' :
                                                 user?.role === 'accountant' ? '💰 محاسب' : '👤 مستخدم'}
                                            </p>
                                        </div>
                                        <div className="profile-actions">
                                            <button className="action-btn logout" onClick={handleLogout}>
                                                <FontAwesomeIcon icon={faSignOutAlt} />تسجيل الخروج
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!user && (
                            <button className="nav-menu-item login-btn" onClick={() => handleNavigation('/login')}>
                                <FontAwesomeIcon icon={faSignOutAlt} />Login
                            </button>
                        )}
                    </div>
                </div>

                <button
                    className={`hamburger ${isMenuOpen ? 'open' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    ref={hamburgerRef}
                    aria-label="Toggle menu"
                >
                    <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="hamburger-icon" />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
