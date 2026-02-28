import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle, FiMail } from 'react-icons/fi';
import { AUTH_ENDPOINTS, apiRequest } from '../../config/api';
import './Auth.css';

const VerifyEmail = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    const email = location.state?.email || localStorage.getItem('pendingVerificationEmail');

    useEffect(() => {
        if (!email) {
            navigate('/registro');
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        // Solo permitir números
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-focus al siguiente input
        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Backspace: mover al input anterior
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`).focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setCode(newCode);

        // Focus al último dígito pegado
        const lastIndex = Math.min(pastedData.length, 5);
        document.getElementById(`code-${lastIndex}`).focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            setError('Por favor ingresa el código completo');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await apiRequest(AUTH_ENDPOINTS.verifyEmail, {
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    codigo: verificationCode
                })
            });

            if (response.success) {
                setSuccess(true);
                localStorage.removeItem('pendingVerificationEmail');
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    navigate('/login', { 
                        state: { 
                            message: 'Email verificado. Ya puedes iniciar sesión.' 
                        } 
                    });
                }, 2000);
            } else {
                setError(response.message || 'Código incorrecto');
            }
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResending(true);
        setError('');

        try {
            const response = await apiRequest(AUTH_ENDPOINTS.resendVerification, {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            if (response.success) {
                alert('Código reenviado. Revisa tu email.');
            } else {
                setError(response.message || 'Error al reenviar código');
            }
        } catch (err) {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setResending(false);
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
                            background: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)',
                            borderRadius: '50%',
                            boxShadow: '0 20px 40px rgba(217, 70, 239, 0.3)',
                            animation: 'successPulse 0.6s ease-out'
                        }}>
                            <FiCheckCircle style={{fontSize: '3rem', color: 'white'}} />
                        </div>
                        
                        <h1 style={{fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem'}}>
                            ¡Email Verificado!
                        </h1>
                        <p style={{color: '#64748b', fontSize: '0.95rem'}}>
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
                        Verifica tu Email
                    </h1>
                    <p style={{color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5'}}>
                        Ingresa el código de 6 dígitos que enviamos a<br/>
                        <strong style={{color: '#475569'}}>{email}</strong>
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
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'center',
                        marginBottom: '2rem'
                    }}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                disabled={loading}
                                style={{
                                    width: '50px',
                                    height: '60px',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    background: 'white',
                                    color: '#1e293b',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#d946ef';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(217, 70, 239, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e2e8f0';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        ))}
                    </div>

                    <button 
                        type="submit" 
                        className="btn-submit"
                        disabled={loading || code.join('').length !== 6}
                        style={{
                            opacity: (loading || code.join('').length !== 6) ? 0.5 : 1,
                            cursor: (loading || code.join('').length !== 6) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Verificando...' : 'Verificar Código'}
                    </button>
                </form>

                <footer style={{textAlign: 'center', marginTop: '2.5rem'}}>
                    <p style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem'}}>
                        ¿No recibiste el código?
                    </p>
                    <button
                        onClick={handleResendCode}
                        disabled={resending}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#d946ef',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: resending ? 'not-allowed' : 'pointer',
                            textDecoration: 'underline',
                            opacity: resending ? 0.5 : 1
                        }}
                    >
                        {resending ? 'Reenviando...' : 'Reenviar código'}
                    </button>
                </footer>
            </main>
        </div>
    );
};

export default VerifyEmail;