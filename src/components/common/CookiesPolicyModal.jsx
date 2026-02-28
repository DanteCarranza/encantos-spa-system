import React from 'react'
import { FiX, FiCheckCircle, FiSettings, FiBarChart2 } from 'react-icons/fi'
import './PrivacyPolicyModal.css'

const CookiesPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="policy-modal-overlay" onClick={onClose}>
      <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="policy-modal-header">
          <div className="policy-header-content">
            <FiCheckCircle className="policy-icon" />
            <h2>Política de Cookies</h2>
          </div>
          <button className="policy-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="policy-modal-body">
          <section className="policy-section">
            <h3>¿Qué son las Cookies?</h3>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita
              nuestro sitio web. Nos ayudan a mejorar su experiencia, recordar sus preferencias y
              entender cómo utiliza nuestros servicios.
            </p>
          </section>

          <section className="policy-section">
            <h3>
              <FiSettings />
              Tipos de Cookies que Utilizamos
            </h3>

            <div className="cookie-type">
              <h4>1. Cookies Esenciales</h4>
              <div className="cookie-badge essential">Obligatorias</div>
              <p>
                Estas cookies son necesarias para el funcionamiento básico del sitio web y no pueden
                ser desactivadas.
              </p>
              <ul>
                <li><strong>Sesión de usuario:</strong> Mantiene su sesión activa mientras navega</li>
                <li><strong>Seguridad:</strong> Protege contra ataques y fraudes</li>
                <li><strong>Preferencias:</strong> Recuerda sus configuraciones básicas</li>
              </ul>
              <p className="duration"><strong>Duración:</strong> Sesión o hasta 12 meses</p>
            </div>

            <div className="cookie-type">
              <h4>2. Cookies de Rendimiento</h4>
              <div className="cookie-badge performance">Opcionales</div>
              <p>
                Recopilan información sobre cómo utiliza nuestro sitio web para ayudarnos a mejorarlo.
              </p>
              <ul>
                <li><strong>Google Analytics:</strong> Analiza el comportamiento de navegación</li>
                <li><strong>Métricas de velocidad:</strong> Mide el tiempo de carga de páginas</li>
                <li><strong>Informes de errores:</strong> Detecta problemas técnicos</li>
              </ul>
              <p className="duration"><strong>Duración:</strong> Hasta 24 meses</p>
            </div>

            <div className="cookie-type">
              <h4>3. Cookies Funcionales</h4>
              <div className="cookie-badge functional">Opcionales</div>
              <p>
                Permiten funcionalidades mejoradas y personalización.
              </p>
              <ul>
                <li><strong>Preferencias de idioma:</strong> Recuerda su idioma preferido</li>
                <li><strong>Recordar información:</strong> Guarda datos de formularios</li>
                <li><strong>Ubicación:</strong> Detecta su ubicación para servicios locales</li>
              </ul>
              <p className="duration"><strong>Duración:</strong> Hasta 12 meses</p>
            </div>

            <div className="cookie-type">
              <h4>4. Cookies de Marketing</h4>
              <div className="cookie-badge marketing">Opcionales</div>
              <p>
                Utilizadas para mostrar anuncios relevantes y medir la efectividad de campañas.
              </p>
              <ul>
                <li><strong>Facebook Pixel:</strong> Seguimiento de conversiones</li>
                <li><strong>Google Ads:</strong> Remarketing y publicidad dirigida</li>
              </ul>
              <p className="duration"><strong>Duración:</strong> Hasta 24 meses</p>
              <p className="note">
                <strong>Nota:</strong> Puede optar por no participar en cookies de marketing sin afectar
                la funcionalidad del sitio.
              </p>
            </div>
          </section>

          <section className="policy-section">
            <h3>
              <FiBarChart2 />
              Cookies de Terceros
            </h3>
            <p>Utilizamos servicios de terceros que pueden establecer sus propias cookies:</p>
            <ul>
              <li><strong>Google Analytics:</strong> Análisis de tráfico web</li>
              <li><strong>Google Maps:</strong> Servicios de mapas y ubicación</li>
              <li><strong>Facebook/Meta:</strong> Integración de redes sociales</li>
              <li><strong>YouTube:</strong> Videos integrados</li>
            </ul>
            <p>
              Estos terceros tienen sus propias políticas de privacidad que puede consultar en sus
              respectivos sitios web.
            </p>
          </section>

          <section className="policy-section">
            <h3>Gestionar sus Preferencias de Cookies</h3>
            <p>Puede controlar y gestionar las cookies de varias maneras:</p>

            <div className="browser-controls">
              <h4>📱 En su Navegador:</h4>
              <ul>
                <li><strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
                <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
                <li><strong>Edge:</strong> Configuración → Privacidad → Cookies</li>
              </ul>
            </div>

            <p className="warning-box">
              ⚠️ <strong>Importante:</strong> Deshabilitar ciertas cookies puede afectar la funcionalidad
              del sitio web y limitar su experiencia.
            </p>
          </section>

          <section className="policy-section">
            <h3>Actualizaciones de esta Política</h3>
            <p>
              Podemos actualizar esta Política de Cookies periódicamente. Le notificaremos sobre cambios
              significativos mediante un aviso en nuestro sitio web.
            </p>
            <p className="last-updated">
              <strong>Última actualización:</strong> 25 de febrero de 2026
            </p>
          </section>

          <section className="policy-section contact-section">
            <h3>Preguntas sobre Cookies</h3>
            <p>
              Si tiene preguntas sobre nuestra Política de Cookies, contáctenos:
            </p>
            <div className="contact-info">
              <p>📧 <strong>Email:</strong> privacidad@encantos.pe</p>
              <p>📞 <strong>Teléfono:</strong> +51 913 516 004</p>
            </div>
          </section>
        </div>

        <div className="policy-modal-footer">
          <button className="btn-accept" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookiesPolicyModal