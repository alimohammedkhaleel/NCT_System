import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import { useGSAP, useStaggerAnimation } from '../hooks/useGSAP';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalPayments: 0,
    totalRevenue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const gsapInstance = useGSAP();
  const statsRef = useRef([]);
  const chartRef = useRef(null);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setStats({
            totalStudents: 1250,
            totalCourses: 45,
            totalPayments: 890,
            totalRevenue: 1250000
          });

          setRecentActivities([
            { id: 1, action: 'تم إضافة درجة جديدة', user: 'د. أحمد محمد', time: 'منذ 5 دقائق' },
            { id: 2, action: 'تم تسجيل دفعة جديدة', user: 'محمد عبدالرحمن', time: 'منذ 15 دقيقة' },
            { id: 3, action: 'تم تسجيل طالب جديد', user: 'أحمد سمير', time: 'منذ ساعة' },
            { id: 4, action: 'تم تحديث المادة', user: 'د. سارة إبراهيم', time: 'منذ ساعتين' }
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        toast.error('فشل في تحميل بيانات لوحة التحكم');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // GSAP animations for stats cards
  useEffect(() => {
    if (!loading && statsRef.current.length > 0) {
      gsap.fromTo(statsRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [loading]);

  // Chart data
  const enrollmentData = [
    { name: 'يناير', students: 120 },
    { name: 'فبراير', students: 150 },
    { name: 'مارس', students: 180 },
    { name: 'أبريل', students: 200 },
    { name: 'مايو', students: 220 },
    { name: 'يونيو', students: 250 }
  ];

  const specialtyData = [
    { name: 'تكنولوجيا المعلومات', value: 35, color: '#0A2472' },
    { name: 'الميكاترونكس', value: 25, color: '#1E3A8A' },
    { name: 'الأوتوترونكس', value: 20, color: '#D4AF37' },
    { name: 'الطاقة المتجددة', value: 15, color: '#F59E0B' },
    { name: 'أخرى', value: 5, color: '#6B7280' }
  ];

  const StatCard = ({ title, value, icon, color, index }) => (
    <motion.div
      ref={el => statsRef.current[index] = el}
      className="stat-card"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <i className={icon}></i>
      </div>
      <div className="stat-content">
        <h3>{value.toLocaleString()}</h3>
        <p>{title}</p>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dashboard-header">
        <motion.h1
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          مرحباً بك، {user?.full_name}
        </motion.h1>
        <motion.p
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          نظرة عامة على نظام الجامعة
        </motion.p>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="stats-grid"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <StatCard
          title="إجمالي الطلاب"
          value={stats.totalStudents}
          icon="fas fa-users"
          color="#0A2472"
          index={0}
        />
        <StatCard
          title="إجمالي المواد"
          value={stats.totalCourses}
          icon="fas fa-book"
          color="#1E3A8A"
          index={1}
        />
        <StatCard
          title="إجمالي المدفوعات"
          value={stats.totalPayments}
          icon="fas fa-money-bill-wave"
          color="#D4AF37"
          index={2}
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={stats.totalRevenue}
          icon="fas fa-chart-line"
          color="#10B981"
          index={3}
        />
      </motion.div>

      {/* Charts Section */}
      <motion.div
        ref={chartRef}
        className="charts-section"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="chart-container">
          <h3>إحصائيات التسجيل الشهرية</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#0A2472"
                strokeWidth={3}
                dot={{ fill: '#0A2472', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>توزيع التخصصات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={specialtyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {specialtyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        className="recent-activities"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <h3>النشاطات الأخيرة</h3>
        <div className="activities-list">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="activity-item"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="activity-icon">
                <i className="fas fa-circle"></i>
              </div>
              <div className="activity-content">
                <p>{activity.action}</p>
                <span>{activity.user} • {activity.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;