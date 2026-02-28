import React from 'react'
import { FiX, FiShield, FiLock, FiEye, FiDatabase } from 'react-icons/fi'
import './PrivacyPolicyModal.css'

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="policy-modal-overlay" onClick={onClose}>
      <div className="policy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="policy-modal-header">
          <div className="policy-header-content">
            <FiShield className="policy-icon" />
            <h2>Política de Privacidad y Seguridad</h2>
          </div>
          <button className="policy-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="policy-modal-body">
          <section className="policy-section">
            <h3>
              <FiLock />
              1. Información que Recopilamos
            </h3>
            <p>
              En Encantos SPA, recopilamos la siguiente información cuando utiliza nuestros servicios
              o registra una reclamación:
            </p>
            <ul>
              <li><strong>Datos personales:</strong> Nombre completo, documento de identidad, correo electrónico, número de teléfono</li>
              <li><strong>Datos de ubicación:</strong> Dirección, departamento, provincia, distrito</li>
              <li><strong>Datos del reclamo:</strong> Descripción del problema, tipo de reclamo, fecha de los hechos</li>
              <li><strong>Datos técnicos:</strong> Dirección IP, tipo de navegador, dispositivo utilizado</li>
            </ul>
          </section>

          <section className="policy-section">
            <h3>
              <FiDatabase />
              2. Uso de la Información
            </h3>
            <p>Utilizamos su información personal para:</p>
            <ul>
              <li>Procesar y dar seguimiento a su reclamación o queja</li>
              <li>Comunicarnos con usted sobre el estado de su caso</li>
              <li>Cumplir con nuestras obligaciones legales según la normativa de INDECOPI</li>
              <li>Mejorar nuestros servicios y la calidad de atención al cliente</li>
              <li>Enviar notificaciones sobre su reclamación</li>
            </ul>
          </section>

          <section className="policy-section">
            <h3>
              <FiEye />
              3. Protección de Datos
            </h3>
            <p>
              Nos comprometemos a proteger su información personal mediante:
            </p>
            <ul>
              <li>Cifrado SSL/TLS en todas las transmisiones de datos</li>
              <li>Almacenamiento seguro en servidores protegidos</li>
              <li>Acceso restringido solo al personal autorizado</li>
              <li>Auditorías periódicas de seguridad</li>
              <li>Cumplimiento de la Ley N° 29733 - Ley de Protección de Datos Personales del Perú</li>
            </ul>
          </section>

          <section className="policy-section">
            <h3>
              <FiShield />
              4. Compartir Información
            </h3>
            <p>
              Su información personal solo será compartida:
            </p>
            <ul>
              <li>Con INDECOPI cuando sea requerido por ley</li>
              <li>Con autoridades competentes en caso de investigaciones legales</li>
              <li>Con proveedores de servicios bajo acuerdos de confidencialidad</li>
            </ul>
            <p className="highlight">
              <strong>Nunca</strong> venderemos, alquilaremos o compartiremos su información con terceros
              para fines comerciales sin su consentimiento explícito.
            </p>
          </section>

          <section className="policy-section">
            <h3>5. Sus Derechos</h3>
            <p>Usted tiene derecho a:</p>
            <ul>
              <li><strong>Acceso:</strong> Solicitar información sobre los datos personales que tenemos</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Cancelación:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos para ciertos fines</li>
            </ul>
            <p>
              Para ejercer estos derechos, contáctenos a: <strong>privacidad@encantos.pe</strong>
            </p>
          </section>

          <section className="policy-section">
            <h3>6. Retención de Datos</h3>
            <p>
              Conservaremos su información personal durante el tiempo necesario para:
            </p>
            <ul>
              <li>Cumplir con los fines para los que fue recopilada</li>
              <li>Cumplir con requisitos legales y regulatorios (mínimo 5 años según normativa INDECOPI)</li>
              <li>Resolver disputas y hacer cumplir nuestros acuerdos</li>
            </ul>
          </section>

          <section className="policy-section">
            <h3>7. Cookies y Tecnologías Similares</h3>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar su experiencia. Para más información,
              consulte nuestra <strong>Política de Cookies</strong>.
            </p>
          </section>

          <section className="policy-section">
            <h3>8. Cambios a esta Política</h3>
            <p>
              Nos reservamos el derecho de actualizar esta política en cualquier momento. Los cambios
              significativos serán notificados en nuestro sitio web.
            </p>
            <p className="last-updated">
              <strong>Última actualización:</strong> 25 de febrero de 2026
            </p>
          </section>

          <section className="policy-section contact-section">
            <h3>9. Contacto</h3>
            <p>
              Si tiene preguntas sobre esta política de privacidad, contáctenos:
            </p>
            <div className="contact-info">
              <p>📧 <strong>Email:</strong> privacidad@encantos.pe</p>
              <p>📞 <strong>Teléfono:</strong> +51 913 516 004</p>
              <p>📍 <strong>Dirección:</strong> Calle Morona #605 / esquina con Moore, Lima, Perú</p>
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

export default PrivacyPolicyModal