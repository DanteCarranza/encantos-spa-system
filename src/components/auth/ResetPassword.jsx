import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { AUTH_ENDPOINTS, apiRequest } from '../../config/api';
import './Auth.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            setError('Token no válido. Por favor solicita un nuevo enlace de recuperación.');
        } else {
            setToken(tokenFromUrl);
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!token) {
            setError('Token no válido. Por favor solicita un nuevo enlace.');
            return;
        }

        setLoading(true);

        try {
            const response = await apiRequest(AUTH_ENDPOINTS.resetPassword, {
                method: 'POST',
                body: JSON.stringify({
                    token: token,
                    password: formData.password
                })
            });

            if (response.success) {
                setSuccess(true);
                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/login', {
                        state: { message: 'Contraseña restablecida. Ya puedes iniciar sesión.' }
                    });
                }, 3000);
            } else {
                setError(response.message || 'Error al restablecer la contraseña');
            }
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="particles-overlay"></div>
                <main className="auth-card">
                    <div style={{textAlign: 'center'}}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '50%',
                            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
                            animation: 'successPulse 0.6s ease-out'
                        }}>
                            <FiCheckCircle style={{fontSize: '3rem', color: 'white'}} />
                        </div>
                        
                        <h1 style={{fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem'}}>
                            ¡Contraseña Restablecida!
                        </h1>
                        <p style={{color: '#64748b', fontSize: '0.95rem', marginBottom: '1rem'}}>
                            Tu contraseña ha sido actualizada exitosamente.
                        </p>
                        <p style={{color: '#64748b', fontSize: '0.85rem'}}>
                            Redirigiendo al inicio de sesión...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="particles-overlay"></div>

            <main className="auth-card">
                <header style={{textAlign: 'center', marginBottom: '2.5rem'}}>
                    <div className="spa-logo-container" style={{width: '100px', height: '100px', marginBottom: '1.5rem'}}>
                        <div className="logo-outer-ring"></div>
                        <div className="logo-lotus" style={{width: '65px', height: '65px'}}>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                                <div 
                                    key={index} 
                                    className="logo-petal"
                                    style={{
                                        '--rotation': `${index * 45}deg`,
                                        transform: `rotate(${index * 45}deg) translateY(13px)`,
                                        width: '26px',
                                        height: '26px'
                                    }}
                                />
                            ))}
                            <div className="logo-center" style={{width: '18px', height: '18px'}}></div>
                            <div className="logo-particle"></div>
                            <div className="logo-particle"></div>
                            <div className="logo-particle"></div>
                            <div className="logo-particle"></div>
                        </div>
                    </div>
                    
                    <h1 style={{fontSize: '2.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem'}}>
                        Nueva Contraseña
                    </h1>
                    <p style={{color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5'}}>
                        Ingresa tu nueva contraseña
                    </p>
                </header>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: '#dc2626',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: 'center'
                    }}>
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>
                            Nueva Contraseña
                        </label>
                        <div className="input-container">
                            <FiLock className="input-icon-left" />
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="auth-input" 
                                placeholder="Mínimo 6 caracteres"
                                required 
                                disabled={loading || !token}
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

                    <div className="form-group">
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>
                            Confirmar Contraseña
                        </label>
                        <div className="input-container">
                            <FiLock className="input-icon-left" />
                            <input 
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="auth-input" 
                                placeholder="Repite tu contraseña"
                                required 
                                disabled={loading || !token}
                            />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-submit" 
                        style={{
                            marginTop: '2rem',
                            opacity: (loading || !token) ? 0.7 : 1,
                            cursor: (loading || !token) ? 'not-allowed' : 'pointer'
                        }}
                        disabled={loading || !token}
                    >
                        {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                    </button>
                </form>

                <footer style={{textAlign: 'center', marginTop: '2.5rem'}}>
                    <Link 
                        to="/login" 
                        style={{
                            color: '#64748b',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            transition: 'color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#d946ef'}
                        onMouseLeave={(e) => e.target.style.color = '#64748b'}
                    >
                        Volver al inicio de sesión
                    </Link>
                </footer>
            </main>
        </div>
    );
};

export default ResetPassword;