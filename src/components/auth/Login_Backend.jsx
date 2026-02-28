import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { AUTH_ENDPOINTS, apiRequest } from '../../config/api';
import './Auth.css';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        recordar: false
    });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Mostrar mensaje de éxito si viene de verificación
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const response = await apiRequest(AUTH_ENDPOINTS.login, {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    recordar: formData.recordar
                })
            });

            if (response.success) {
                // Guardar token y datos del usuario
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data.usuario));
                localStorage.setItem('tokenExpiration', response.data.expiracion);
                
                // Redirigir al dashboard o página principal
                navigate('/');
            } else {
                setError(response.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="particles-overlay"></div>

            {/* Botón para volver al inicio */}
            <Link 
                to="/" 
                style={{
                    position: 'fixed',
                    top: '2rem',
                    left: '2rem',
                    zIndex: 100,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(217, 70, 239, 0.2)',
                    borderRadius: '50px',
                    color: '#64748b',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(217, 70, 239, 0.1)';
                    e.currentTarget.style.borderColor = '#d946ef';
                    e.currentTarget.style.color = '#d946ef';
                    e.currentTarget.style.transform = 'translateX(-5px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(217, 70, 239, 0.2)';
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
            >
                <FiArrowLeft style={{fontSize: '1.2rem'}} />
                <span>Volver al inicio</span>
            </Link>

            <main className="auth-card">
                <header style={{textAlign: 'center', marginBottom: '2.5rem'}}>
                    <div className="spa-logo-container">
                        <div className="logo-outer-ring"></div>
                        <div className="logo-lotus">
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                                <div 
                                    key={index} 
                                    className="logo-petal"
                                    style={{
                                        '--rotation': `${index * 45}deg`,
                                        transform: `rotate(${index * 45}deg) translateY(15px)`
                                    }}
                                />
                            ))}
                            <div className="logo-center"></div>
                            <div className="logo-particle"></div>
                            <div className="logo-particle"></div>
                            <div className="logo-particle"></div>
                            <div className="logo-particle"></div>
                        </div>
                    </div>
                    
                    <h1 style={{fontSize: '2.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem'}}>
                        Bienvenido
                    </h1>
                    <p style={{color: '#64748b', fontWeight: 500, fontSize: '1rem'}}>
                        Tu oasis de paz te espera
                    </p>
                </header>

                {successMessage && (
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: '#16a34a',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: '#dc2626',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="input-container">
                            <FiMail className="input-icon-left" />
                            <input 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="auth-input" 
                                placeholder="tu@correo.com"
                                required 
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-container">
                            <FiLock className="input-icon-left" />
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="auth-input" 
                                placeholder="Tu contraseña"
                                required 
                                disabled={loading}
                            />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '2.5rem', 
                        fontSize: '0.85rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                    }}>
                        <label style={{
                            color: '#64748b', 
                            fontWeight: 600, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '5px',
                            cursor: 'pointer'
                        }}>
                            <input 
                                type="checkbox"
                                name="recordar"
                                checked={formData.recordar}
                                onChange={handleChange}
                                disabled={loading}
                                style={{
                                    accentColor: '#d946ef',
                                    cursor: 'pointer'
                                }} 
                            /> 
                            Recordarme
                        </label>
                        <Link 
                            to="/recuperar" 
                            style={{
                                color: '#d946ef', 
                                fontWeight: 700, 
                                textDecoration: 'none',
                                transition: 'opacity 0.3s ease'
                            }}
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={loading}
                        style={{
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Iniciando sesión...' : 'Entrar al SPA'}
                    </button>
                </form>

                <footer style={{
                    textAlign: 'center', 
                    marginTop: '2.5rem', 
                    color: '#64748b',
                    fontSize: '0.95rem'
                }}>
                    <p>
                        ¿No tienes cuenta?{' '}
                        <Link 
                            to="/registro" 
                            style={{
                                color: '#d946ef', 
                                fontWeight: 800, 
                                textDecoration: 'none',
                                transition: 'opacity 0.3s ease'
                            }}
                        >
                            Regístrate
                        </Link>
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default Login;