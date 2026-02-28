import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { AUTH_ENDPOINTS, apiRequest } from '../../config/api';
import './Auth.css';

const ForgotPassword = () => {
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiRequest(AUTH_ENDPOINTS.forgotPassword, {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            if (response.success) {
                setEmailSent(true);
            } else {
                setError(response.message || 'Error al enviar el email');
            }
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setEmailSent(false);
        setError('');
    };

    return (
        <div className="auth-container">
            {/* Partículas de luz externas */}
            <div className="particles-overlay"></div>

            <main className="auth-card">
                {!emailSent ? (
                    <>
                        <header style={{textAlign: 'center', marginBottom: '2.5rem'}}>
                            {/* LOGO SPA MEJORADO */}
                            <div className="spa-logo-container" style={{width: '100px', height: '100px', marginBottom: '1.5rem'}}>
                                {/* Anillo exterior pulsante */}
                                <div className="logo-outer-ring"></div>
                                
                                {/* Flor de loto con pétalos animados */}
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
                                    
                                    {/* Centro brillante */}
                                    <div className="logo-center" style={{width: '18px', height: '18px'}}></div>
                                    
                                    {/* Partículas flotantes */}
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
                                marginBottom: '0.5rem'
                            }}>
                                Recuperar Acceso
                            </h1>
                            <p style={{
                                color: '#64748b', 
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                maxWidth: '320px',
                                margin: '0 auto'
                            }}>
                                Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña
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
                                    Correo Electrónico
                                </label>
                                <div className="input-container">
                                    <FiMail className="input-icon-left" />
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="auth-input" 
                                        placeholder="tu@correo.com"
                                        required 
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn-submit" 
                                style={{
                                    marginTop: '2rem',
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                            </button>
                        </form>

                        <footer style={{
                            textAlign: 'center', 
                            marginTop: '2.5rem'
                        }}>
                            <Link 
                                to="/login" 
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#64748b',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease',
                                    padding: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#d946ef';
                                    e.currentTarget.style.transform = 'translateX(-3px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#64748b';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <FiArrowLeft /> Volver al inicio de sesión
                            </Link>
                        </footer>
                    </>
                ) : (
                    // Estado de confirmación después de enviar el email
                    <>
                        <header style={{textAlign: 'center', marginBottom: '2rem'}}>
                            {/* Icono de confirmación */}
                            <div style={{
                                width: '100px',
                                height: '100px',
                                margin: '0 auto 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)',
                                borderRadius: '50%',
                                boxShadow: '0 20px 40px rgba(217, 70, 239, 0.3)',
                                animation: 'successPulse 0.6s ease-out'
                            }}>
                                <FiCheckCircle 
                                    style={{
                                        fontSize: '3rem',
                                        color: 'white'
                                    }}
                                />
                            </div>
                            
                            <h1 style={{
                                fontSize: '2rem', 
                                fontWeight: 800, 
                                color: '#1e293b', 
                                letterSpacing: '-1px',
                                marginBottom: '0.5rem'
                            }}>
                                ¡Email Enviado!
                            </h1>
                            <p style={{
                                color: '#64748b', 
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                maxWidth: '340px',
                                margin: '0 auto'
                            }}>
                                Hemos enviado un enlace de recuperación a <strong style={{color: '#475569'}}>{email}</strong>. 
                                Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
                            </p>
                        </header>

                        <div style={{
                            background: 'rgba(217, 70, 239, 0.05)',
                            border: '1px solid rgba(217, 70, 239, 0.2)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            marginBottom: '2rem'
                        }}>
                            <p style={{
                                color: '#64748b',
                                fontSize: '0.85rem',
                                lineHeight: '1.5',
                                margin: 0,
                                textAlign: 'center'
                            }}>
                                <strong style={{color: '#475569'}}>Nota:</strong> Si no recibes el correo en unos minutos, 
                                revisa tu carpeta de spam o correo no deseado.
                            </p>
                        </div>

                        <footer style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            alignItems: 'center'
                        }}>
                            <button 
                                onClick={handleResend}
                                className="btn-submit"
                                style={{
                                    background: 'white',
                                    color: '#d946ef',
                                    border: '2px solid #d946ef',
                                    boxShadow: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(217, 70, 239, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                Enviar Nuevamente
                            </button>

                            <Link 
                                to="/login" 
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#64748b',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease',
                                    padding: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = '#d946ef';
                                    e.currentTarget.style.transform = 'translateX(-3px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = '#64748b';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <FiArrowLeft /> Volver al inicio de sesión
                            </Link>
                        </footer>
                    </>
                )}
            </main>
        </div>
    );
};

export default ForgotPassword;