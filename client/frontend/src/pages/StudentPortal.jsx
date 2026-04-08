import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import './StudentPortal.css';

const StudentPortal = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [portalForm, setPortalForm] = useState({ studentId: '', lastName: '' });
  const [portalResult, setPortalResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPortalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePortalSubmit = (e) => {
    e.preventDefault();
    if (!portalForm.studentId || !portalForm.lastName) {
      setPortalResult({ error: 'Please enter student ID and last name.' });
      return;
    }

    // Mock data - in real app, fetch from API
    setPortalResult({
      studentId: portalForm.studentId,
      name: 'Nahla Ahmed',
      major: 'Computer Science and Engineering',
      year: '3rd Year',
      gpa: '3.87',
      status: 'Active',
      grades: [
        { course: 'Programming Fundamentals', grade: 'A' },
        { course: 'Data Structures', grade: 'A-' },
        { course: 'Database Systems', grade: 'B+' },
        { course: 'Web Development', grade: 'A' }
      ],
      photoUrl: 'https://i.pravatar.cc/180?img=12'
    });
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="student-portal-page">
        <section className="portal-hero">
          <div className="portal-hero-content">
            <h1>Student Portal</h1>
            <p>Access your academic record, grades, and profile details instantly.</p>
          </div>
        </section>

        <section className="portal-content">
          <div className="portal-search">
            <h2>Search Student Information</h2>
            <p>Enter your student ID and last name to view your academic profile.</p>
            <form className="portal-form" onSubmit={handlePortalSubmit}>
              <label>
                Student ID
                <input
                  type="text"
                  name="studentId"
                  value={portalForm.studentId}
                  onChange={handleChange}
                  placeholder="Enter student ID"
                  required
                />
              </label>
              <label>
                Last Name
                <input
                  type="text"
                  name="lastName"
                  value={portalForm.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </label>
              <button type="submit" className="primary-btn">View Portal</button>
            </form>
          </div>

          {portalResult && (
            <div className="portal-results">
              {portalResult.error ? (
                <div className="portal-error">{portalResult.error}</div>
              ) : (
                <div className="student-profile">
                  <div className="profile-header">
                    <img src={portalResult.photoUrl} alt="Student" />
                    <div>
                      <h3>{portalResult.name}</h3>
                      <span>{portalResult.studentId}</span>
                      <p>{portalResult.major}</p>
                    </div>
                  </div>
                  <div className="profile-stats">
                    <div><strong>Year</strong><span>{portalResult.year}</span></div>
                    <div><strong>GPA</strong><span>{portalResult.gpa}</span></div>
                    <div><strong>Status</strong><span>{portalResult.status}</span></div>
                  </div>
                  <div className="profile-grades">
                    <h4>Recent Grades</h4>
                    <ul>
                      {portalResult.grades.map((item, index) => (
                        <li key={index}>
                          <span>{item.course}</span>
                          <strong>{item.grade}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="portal-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>New Cairo University of Technology</h4>
            <p>Engineering the Next Generation of Innovators</p>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>Email: info@nctu.edu.eg</p>
            <p>Phone: +20 123 456 7890</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 NCTU. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default StudentPortal;