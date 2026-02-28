import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { AUTH_ENDPOINTS, apiRequest } from '../../config/api';
import './Auth.css';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nombre_completo: '',
        email: '',
        telefono: '',
        password: '',
        aceptaTerminos: false
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError(''); // Limpiar error al escribir
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validaciones
        if (!formData.aceptaTerminos) {
            setError('Debes aceptar los términos y condiciones');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        if (!/^9\d{8}$/.test(formData.telefono)) {
            setError('El teléfono debe tener 9 dígitos y empezar con 9');
            setLoading(false);
            return;
        }

        try {
            const response = await apiRequest(AUTH_ENDPOINTS.register, {
                method: 'POST',
                body: JSON.stringify({
                    nombre_completo: formData.nombre_completo,
                    email: formData.email,
                    telefono: formData.telefono,
                    password: formData.password
                })
            });

            if (response.success) {
                // Guardar email en localStorage para usarlo en verificación
                localStorage.setItem('pendingVerificationEmail', formData.email);
                
                // Redirigir a página de verificación
                navigate('/verificar-email', { 
                    state: { 
                        email: formData.email,
                        message: response.message 
                    } 
                });
            } else {
                setError(response.message || 'Error al registrar usuario');
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

            <main className="auth-card">
                <header style={{textAlign: 'center', marginBottom: '2rem'}}>
                    <div className="spa-logo-container" style={{width: '90px', height: '90px', marginBottom: '1.5rem'}}>
                        <div className="logo-outer-ring"></div>
                        <div className="logo-lotus" style={{width: '60px', height: '60px'}}>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                                <div 
                                    key={index} 
                                    className="logo-petal"
                                    style={{
                                        '--rotation': `${index * 45}deg`,
                                        transform: `rotate(${index * 45}deg) translateY(12px)`,
                                        width: '24px',
                                        height: '24px'
                                    }}
                                />
                            ))}
                            <div className="logo-center" style={{width: '16px', height: '16px'}}></div>
                            <div className="logo-particle"></div>
                            <div className="logo-particle"></div>
                            <div className="logo-particle"></div>
                            <div className="logo-particle"></div>
                        </div>
                    </div>
                    
                    <h1 style={{
                        fontSize: '2.2rem', 
                        fontWeight: 800, 
                        color: '#1e293b', 
                        letterSpacing: '-1px',
                        marginBottom: '0.4rem'
                    }}>
                        Crear Cuenta
                    </h1>
                    <p style={{
                        color: '#64748b', 
                        fontWeight: 500,
                        fontSize: '0.95rem'
                    }}>
                        Únete a nuestra experiencia de bienestar
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
                        textAlign: 'center'
                    }}>
                        {error}
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
                            Nombre Completo
                        </label>
                        <div className="input-container">
                            <FiUser className="input-icon-left" />
                            <input 
                                type="text"
                                name="nombre_completo"
                                value={formData.nombre_completo}
                                onChange={handleChange}
                                className="auth-input" 
                                placeholder="Juan Pérez"
                                required 
                                disabled={loading}
                            />
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
                            Correo Electrónico
                        </label>
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
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>
                            Teléfono
                        </label>
                        <div className="input-container">
                            <FiPhone className="input-icon-left" />
                            <input 
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="auth-input" 
                                placeholder="987654321"
                                required 
                                disabled={loading}
                                maxLength="9"
                            />
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
                            Contraseña
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
                                disabled={loading}
                            />
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div style={{marginBottom: '2rem', marginTop: '1.5rem'}}>
                        <label style={{
                            color: '#64748b', 
                            fontWeight: 600, 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            lineHeight: '1.5'
                        }}>
                            <input 
                                type="checkbox"
                                name="aceptaTerminos"
                                checked={formData.aceptaTerminos}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                style={{
                                    accentColor: '#d946ef',
                                    cursor: 'pointer',
                                    marginTop: '3px',
                                    minWidth: '16px'
                                }} 
                            /> 
                            <span>
                                Acepto los{' '}
                                <Link 
                                    to="/terminos" 
                                    style={{
                                        color: '#d946ef', 
                                        fontWeight: 700, 
                                        textDecoration: 'none',
                                        transition: 'opacity 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                                >
                                    términos y condiciones
                                </Link>
                            </span>
                        </label>
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
                        {loading ? 'Registrando...' : 'Registrarme'}
                    </button>
                </form>

                <footer style={{
                    textAlign: 'center', 
                    marginTop: '2rem', 
                    color: '#64748b',
                    fontSize: '0.95rem'
                }}>
                    <p>
                        ¿Ya tienes cuenta?{' '}
                        <Link 
                            to="/login" 
                            style={{
                                color: '#d946ef', 
                                fontWeight: 800, 
                                textDecoration: 'none',
                                transition: 'opacity 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                            Inicia sesión
                        </Link>
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default Register;