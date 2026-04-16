import styles from './Notification.module.css';

export default function Notification({ notification }) {
  if (!notification) return null;

  return (
    <div 
      className={`${styles.notification} ${styles[notification.type]}`}
      role="alert"
      aria-live="assertive"
    >
      {notification.message}
    </div>
  );
}
