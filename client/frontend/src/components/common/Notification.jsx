import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import styles from './Notification.module.css';

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className={styles.container}>
      {notifications.map(notification => (
        <div key={notification.id} className={`${styles.notification} ${styles[notification.type]}`}>
          <span>{notification.message}</span>
          <button 
            onClick={() => removeNotification(notification.id)}
            className={styles.closeBtn}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
