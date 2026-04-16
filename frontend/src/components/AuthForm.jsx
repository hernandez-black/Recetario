import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './AuthForm.module.css';

// Validaciones del lado del cliente
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'El email es requerido';
  if (!emailRegex.test(email)) return 'Formato de email inválido';
  return null;
};

const validatePassword = (password) => {
  if (!password) return 'La contraseña es requerida';
  if (password.length < 8) return 'La contraseña debe tener mínimo 8 caracteres';
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*#?&]/.test(password);
  const combinations = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
  if (combinations < 2) {
    return 'La contraseña debe combinar letras, números o caracteres especiales (@$!%*#?&)';
  }
  return null;
};

const validateUsername = (username) => {
  if (!username) return 'El nombre de usuario es requerido';
  if (username.length < 3 || username.length > 30) return 'El username debe tener entre 3 y 30 caracteres';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Solo se permiten letras, números y guión bajo (_)';
  return null;
};

export default function AuthForm({ onSuccess }) {
  const { register, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccessMsg('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const username = formData.get('username');

    // Validación del cliente antes de enviar al servidor
    const errors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    if (!isLogin) {
      const usernameError = validateUsername(username);
      if (usernameError) errors.username = usernameError;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        onSuccess?.();
      } else {
        await register(email, password, username);
        setSuccessMsg('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
        setIsLogin(true);
        e.target.reset();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.container}>
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>

        {error && <div className={styles.error}>{error}</div>}
        {successMsg && <div className={styles.success}>{successMsg}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="username">Usuario:</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="cocinillas99"
                required
              />
              {fieldErrors.username && (
                <span className={styles.fieldError}>{fieldErrors.username}</span>
              )}
              <span className={styles.hint}>3–30 caracteres: letras, números o guión bajo (_)</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tu@email.com"
              required
            />
            {fieldErrors.email && (
              <span className={styles.fieldError}>{fieldErrors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              required
            />
            {fieldErrors.password && (
              <span className={styles.fieldError}>{fieldErrors.password}</span>
            )}
            {!isLogin && (
              <span className={styles.hint}>
                Mínimo 8 caracteres combinando letras, números o caracteres especiales (@$!%*#?&)
              </span>
            )}
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className={styles.toggle}>
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFieldErrors({});
              setSuccessMsg('');
            }}
            className={styles.toggleBtn}
          >
            {isLogin ? 'Registrate' : 'Inicia Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
