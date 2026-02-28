import React, { useState, useEffect } from 'react'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiShoppingBag,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiUserPlus,
  FiX,
  FiSave,
  FiLock,
  FiUnlock,
  FiTrendingUp,
  FiClock,
  FiStar
} from 'react-icons/fi'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Swal from 'sweetalert2'
import './AdminUsersPage.css'
import usersService from '../../services/usersService'

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_desc')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    rol: 'cliente',
    password: '',
    activo: true
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    
    try {
      const result = await usersService.getUsers({
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      });
      
      if (result.success) {
        setUsers(result.data);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'No se pudieron cargar los usuarios'
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión al cargar usuarios'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (rol) => {
    const roles = {
      admin: { label: 'Administrador', class: 'primary', icon: FiLock },
      terapeuta: { label: 'Terapeuta', class: 'success', icon: FiUser },
      cliente: { label: 'Cliente', class: 'info', icon: FiUser }
    }
    return roles[rol] || roles.cliente
  }

  const formatPrice = (price) => {
    return `S/ ${price.toFixed(2)}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        direccion: user.direccion,
        rol: user.rol,
        password: '',
        activo: user.activo
      })
    } else {
      setSelectedUser(null)
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        rol: 'cliente',
        password: '',
        activo: true
      })
    }
    setErrors({})
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedUser(null)
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      rol: 'cliente',
      password: '',
      activo: true
    })
    setErrors({})
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    } else if (!/^[0-9]{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido (9 dígitos)'
    }

    if (!selectedUser && !formData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (!selectedUser && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    try {
      let result;
      
      if (selectedUser) {
        // Actualizar usuario
        result = await usersService.updateUser(selectedUser.id, formData);
      } else {
        // Crear nuevo usuario
        result = await usersService.createUser(formData);
      }
  
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: selectedUser ? '¡Usuario Actualizado!' : '¡Usuario Creado!',
          text: result.message,
          confirmButtonColor: '#d946ef'
        });
        
        handleCloseModal();
        loadUsers(); // Recargar lista
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message || 'Error al guardar el usuario'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar el usuario'
      });
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user)
    setConfirmAction({ type: 'delete' })
    setShowConfirm(true)
  }

  const handleToggleStatus = (user) => {
    setSelectedUser(user)
    setConfirmAction({ type: 'toggle' })
    setShowConfirm(true)
  }

  const confirmActionHandler = async () => {
    try {
      let result;
      
      if (confirmAction.type === 'delete') {
        result = await usersService.deleteUser(selectedUser.id);
        
        if (result.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Usuario Eliminado!',
            text: result.message,
            confirmButtonColor: '#d946ef',
            timer: 2000
          });
          loadUsers();
        }
      } else if (confirmAction.type === 'toggle') {
        result = await usersService.toggleUserStatus(selectedUser.id, selectedUser.activo);
        
        if (result.success) {
          Swal.fire({
            icon: 'success',
            title: 'Estado Actualizado',
            text: `El usuario ahora está ${!selectedUser.activo ? 'activo' : 'inactivo'}`,
            confirmButtonColor: '#d946ef',
            timer: 2000
          });
          loadUsers();
        }
      }
      
      if (!result.success) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al procesar la acción'
      });
    }
    
    setShowConfirm(false);
    setSelectedUser(null);
    setConfirmAction(null);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setShowDetailModal(true)
  }

  const exportToCSV = () => {
    usersService.exportToCSV(filteredUsers);
    
    Swal.fire({
      icon: 'success',
      title: 'Exportado',
      text: 'El archivo CSV se ha descargado correctamente',
      confirmButtonColor: '#d946ef',
      timer: 2000
    });
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch =
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telefono.includes(searchTerm)

      const matchesRole = roleFilter === 'all' || user.rol === roleFilter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.activo) ||
        (statusFilter === 'inactive' && !user.activo)

      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'created_desc') {
        return new Date(b.fecha_registro) - new Date(a.fecha_registro)
      } else if (sortBy === 'created_asc') {
        return new Date(a.fecha_registro) - new Date(b.fecha_registro)
      } else if (sortBy === 'name_asc') {
        return a.nombre.localeCompare(b.nombre)
      } else if (sortBy === 'name_desc') {
        return b.nombre.localeCompare(a.nombre)
      } else if (sortBy === 'spent_desc') {
        return b.total_gastado - a.total_gastado
      } else if (sortBy === 'spent_asc') {
        return a.total_gastado - b.total_gastado
      }
      return 0
    })

  const stats = {
    total: users.length,
    clientes: users.filter(u => u.rol === 'cliente').length,
    terapeutas: users.filter(u => u.rol === 'terapeuta').length,
    admins: users.filter(u => u.rol === 'admin').length,
    activos: users.filter(u => u.activo).length,
    inactivos: users.filter(u => !u.activo).length,
    totalRevenue: users
      .filter(u => u.rol === 'cliente')
      .reduce((sum, u) => sum + u.total_gastado, 0)
  }

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="spinner-large"></div>
        <p>Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="admin-users-page">
      {/* Header */}
      <div className="users-header">
        <div>
          <h1 className="users-title">Gestión de Usuarios</h1>
          <p className="users-subtitle">Administra clientes, terapeutas y administradores</p>
        </div>
        <div className="users-actions">
          <button className="btn btn-outline" onClick={exportToCSV}>
            <FiDownload />
            Exportar CSV
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FiUserPlus />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="users-stats">
        <div className="stat-card-users stat-total">
          <div className="stat-icon-users">
            <FiUser />
          </div>
          <div className="stat-content-users">
            <div className="stat-value-users">{stats.total}</div>
            <div className="stat-label-users">Total Usuarios</div>
          </div>
        </div>

        <div className="stat-card-users stat-clients">
          <div className="stat-icon-users">
            <FiUser />
          </div>
          <div className="stat-content-users">
            <div className="stat-value-users">{stats.clientes}</div>
            <div className="stat-label-users">Clientes</div>
          </div>
        </div>

        <div className="stat-card-users stat-therapists">
          <div className="stat-icon-users">
            <FiUser />
          </div>
          <div className="stat-content-users">
            <div className="stat-value-users">{stats.terapeutas}</div>
            <div className="stat-label-users">Terapeutas</div>
          </div>
        </div>

        <div className="stat-card-users stat-admins">
          <div className="stat-icon-users">
            <FiLock />
          </div>
          <div className="stat-content-users">
            <div className="stat-value-users">{stats.admins}</div>
            <div className="stat-label-users">Administradores</div>
          </div>
        </div>

        <div className="stat-card-users stat-active">
          <div className="stat-icon-users">
            <FiUnlock />
          </div>
          <div className="stat-content-users">
            <div className="stat-value-users">{stats.activos}</div>
            <div className="stat-label-users">Activos</div>
          </div>
        </div>

        <div className="stat-card-users stat-revenue">
          <div className="stat-icon-users">
            <FiDollarSign />
          </div>
          <div className="stat-content-users">
            <div className="stat-value-users">{formatPrice(stats.totalRevenue)}</div>
            <div className="stat-label-users">Ingresos Totales</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="users-filters">
        <div className="search-box-users">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="filters-row-users">
          <div className="filter-group-users">
            <FiFilter />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select-users"
            >
              <option value="all">Todos los roles</option>
              <option value="cliente">Clientes</option>
              <option value="terapeuta">Terapeutas</option>
              <option value="admin">Administradores</option>
            </select>
          </div>

          <div className="filter-group-users">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select-users"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div className="filter-group-users">
            <span>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select-users"
            >
              <option value="created_desc">Más recientes</option>
              <option value="created_asc">Más antiguos</option>
              <option value="name_asc">Nombre (A-Z)</option>
              <option value="name_desc">Nombre (Z-A)</option>
              <option value="spent_desc">Mayor gasto</option>
              <option value="spent_asc">Menor gasto</option>
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista en cuadrícula"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="2" width="7" height="7" rx="1" />
                <rect x="11" y="2" width="7" height="7" rx="1" />
                <rect x="2" y="11" width="7" height="7" rx="1" />
                <rect x="11" y="11" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Vista en tabla"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="4" width="16" height="2" rx="1" />
                <rect x="2" y="9" width="16" height="2" rx="1" />
                <rect x="2" y="14" width="16" height="2" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info-users">
        Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> usuarios
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="users-grid">
          {filteredUsers.map(user => {
            const roleInfo = getRoleInfo(user.rol)
            const RoleIcon = roleInfo.icon

            return (
              <div key={user.id} className={`user-card ${!user.activo ? 'inactive' : ''}`}>
                <div className="user-card-header">
                  <div className="user-avatar-large">
                    {user.nombre.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className={`role-badge ${roleInfo.class}`}>
                    <RoleIcon />
                    {roleInfo.label}
                  </span>
                </div>

                <div className="user-card-body">
                  <h3 className="user-name">{user.nombre}</h3>

                  <div className="user-info-grid">
                    <div className="info-item-card">
                      <FiMail />
                      <span>{user.email}</span>
                    </div>
                    <div className="info-item-card">
                      <FiPhone />
                      <span>{user.telefono}</span>
                    </div>
                    <div className="info-item-card">
                      <FiMapPin />
                      <span>{user.direccion}</span>
                    </div>
                  </div>

                  {user.rol === 'cliente' && (
                    <div className="user-stats-card">
                      <div className="stat-item-card">
                        <FiShoppingBag />
                        <div>
                          <span className="stat-value-card">{user.total_citas}</span>
                          <span className="stat-label-card">Citas</span>
                        </div>
                      </div>
                      <div className="stat-item-card">
                        <FiDollarSign />
                        <div>
                          <span className="stat-value-card">{formatPrice(user.total_gastado)}</span>
                          <span className="stat-label-card">Total Gastado</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {user.rol === 'terapeuta' && (
                    <div className="user-stats-card">
                      <div className="stat-item-card">
                        <FiCalendar />
                        <div>
                          <span className="stat-value-card">{user.total_citas}</span>
                          <span className="stat-label-card">Sesiones</span>
                        </div>
                      </div>
                      <div className="stat-item-card">
                        <FiStar />
                        <div>
                          <span className="stat-value-card">4.8</span>
                          <span className="stat-label-card">Valoración</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="user-meta">
                    <div className="meta-item">
                      <FiCalendar />
                      <span>Registro: {formatDate(user.fecha_registro)}</span>
                    </div>
                    {user.ultima_cita && (
                      <div className="meta-item">
                        <FiClock />
                        <span>Última cita: {formatDate(user.ultima_cita)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="user-card-footer">
                  <button
                    className={`btn-icon-user ${user.activo ? 'success' : 'warning'}`}
                    onClick={() => handleToggleStatus(user)}
                    title={user.activo ? 'Desactivar' : 'Activar'}
                  >
                    {user.activo ? <FiUnlock /> : <FiLock />}
                  </button>
                  <button
                    className="btn-icon-user info"
                    onClick={() => handleViewDetails(user)}
                    title="Ver detalles"
                  >
                    <FiEye />
                  </button>
                  <button
                    className="btn-icon-user primary"
                    onClick={() => handleOpenModal(user)}
                    title="Editar"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn-icon-user danger"
                    onClick={() => handleDelete(user)}
                    title="Eliminar"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                {!user.activo && (
                  <div className="inactive-overlay">
                    <FiLock />
                    <span>Usuario Inactivo</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Table View - Continuaré en el siguiente mensaje... */}
      {/* Table View */}
      {viewMode === 'table' && (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Rol</th>
                <th>Estadísticas</th>
                <th>Registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const roleInfo = getRoleInfo(user.rol)
                const RoleIcon = roleInfo.icon

                return (
                  <tr key={user.id} className={!user.activo ? 'inactive-row' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-table">
                          {user.nombre.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="user-info-table">
                          <div className="user-name-table">{user.nombre}</div>
                          <div className="user-address-table">
                            <FiMapPin />
                            {user.direccion}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div className="contact-item">
                          <FiMail />
                          <span>{user.email}</span>
                        </div>
                        <div className="contact-item">
                          <FiPhone />
                          <span>{user.telefono}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge-table ${roleInfo.class}`}>
                        <RoleIcon />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="stats-cell">
                        {user.rol === 'cliente' && (
                          <>
                            <div className="stat-mini">
                              <FiShoppingBag />
                              <span>{user.total_citas} citas</span>
                            </div>
                            <div className="stat-mini revenue">
                              <FiDollarSign />
                              <span>{formatPrice(user.total_gastado)}</span>
                            </div>
                          </>
                        )}
                        {user.rol === 'terapeuta' && (
                          <>
                            <div className="stat-mini">
                              <FiCalendar />
                              <span>{user.total_citas} sesiones</span>
                            </div>
                            <div className="stat-mini">
                              <FiStar />
                              <span>4.8 valoración</span>
                            </div>
                          </>
                        )}
                        {user.rol === 'admin' && (
                          <div className="stat-mini">
                            <FiLock />
                            <span>Acceso total</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        {formatDate(user.fecha_registro)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge-table ${user.activo ? 'active' : 'inactive'}`}>
                        {user.activo ? <FiUnlock /> : <FiLock />}
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell-table">
                        <button
                          className="btn-action-table view"
                          onClick={() => handleViewDetails(user)}
                          title="Ver detalles"
                        >
                          <FiEye />
                        </button>
                        <button
                          className="btn-action-table edit"
                          onClick={() => handleOpenModal(user)}
                          title="Editar"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-action-table toggle"
                          onClick={() => handleToggleStatus(user)}
                          title={user.activo ? 'Desactivar' : 'Activar'}
                        >
                          {user.activo ? <FiLock /> : <FiUnlock />}
                        </button>
                        <button
                          className="btn-action-table delete"
                          onClick={() => handleDelete(user)}
                          title="Eliminar"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state-users">
              <div className="empty-icon-users">👥</div>
              <h3>No se encontraron usuarios</h3>
              <p>Intenta con otros filtros de búsqueda</p>
            </div>
          )}
        </div>
      )}

      {filteredUsers.length === 0 && viewMode === 'grid' && (
        <div className="empty-state-users">
          <div className="empty-icon-users">👥</div>
          <h3>No se encontraron usuarios</h3>
          <p>Intenta con otros filtros de búsqueda</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-grid-users">
            <div className="form-group-users form-full">
              <label className="form-label-users">Nombre Completo *</label>
              <div className="input-wrapper-users">
                <FiUser className="input-icon-users" />
                <input
                  type="text"
                  name="nombre"
                  className={`form-input-users ${errors.nombre ? 'error' : ''}`}
                  placeholder="Ej: María González"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>
              {errors.nombre && <span className="form-error-users">{errors.nombre}</span>}
            </div>

            <div className="form-group-users">
              <label className="form-label-users">Email *</label>
              <div className="input-wrapper-users">
                <FiMail className="input-icon-users" />
                <input
                  type="email"
                  name="email"
                  className={`form-input-users ${errors.email ? 'error' : ''}`}
                  placeholder="email@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <span className="form-error-users">{errors.email}</span>}
            </div>

            <div className="form-group-users">
              <label className="form-label-users">Teléfono *</label>
              <div className="input-wrapper-users">
                <FiPhone className="input-icon-users" />
                <input
                  type="tel"
                  name="telefono"
                  className={`form-input-users ${errors.telefono ? 'error' : ''}`}
                  placeholder="999999999"
                  value={formData.telefono}
                  onChange={handleChange}
                  maxLength={9}
                />
              </div>
              {errors.telefono && <span className="form-error-users">{errors.telefono}</span>}
            </div>

            <div className="form-group-users form-full">
              <label className="form-label-users">Dirección</label>
              <div className="input-wrapper-users">
                <FiMapPin className="input-icon-users" />
                <input
                  type="text"
                  name="direccion"
                  className="form-input-users"
                  placeholder="Dirección completa"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group-users">
              <label className="form-label-users">Rol *</label>
              <select
                name="rol"
                className="form-input-users"
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="cliente">Cliente</option>
                <option value="terapeuta">Terapeuta</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="form-group-users">
              <label className="form-label-users">
                {selectedUser ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
              </label>
              <div className="input-wrapper-users">
                <FiLock className="input-icon-users" />
                <input
                  type="password"
                  name="password"
                  className={`form-input-users ${errors.password ? 'error' : ''}`}
                  placeholder={selectedUser ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {errors.password && <span className="form-error-users">{errors.password}</span>}
            </div>

            <div className="form-group-users form-full">
              <label className="checkbox-label-users">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                />
                <span>Usuario activo (puede acceder al sistema)</span>
              </label>
            </div>
          </div>

          <div className="form-actions-users">
            <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
              <FiX />
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <FiSave />
              {selectedUser ? 'Actualizar' : 'Crear'} Usuario
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Detalles del Usuario"
        size="large"
      >
        {selectedUser && (
          <div className="user-detail-modal">
            <div className="detail-header-user">
              <div className="detail-avatar-large">
                {selectedUser.nombre.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="detail-user-info">
                <h2 className="detail-user-name">{selectedUser.nombre}</h2>
                <span className={`role-badge-detail ${getRoleInfo(selectedUser.rol).class}`}>
                  {React.createElement(getRoleInfo(selectedUser.rol).icon)}
                  {getRoleInfo(selectedUser.rol).label}
                </span>
                <span className={`status-badge-detail ${selectedUser.activo ? 'active' : 'inactive'}`}>
                  {selectedUser.activo ? <FiUnlock /> : <FiLock />}
                  {selectedUser.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div className="detail-sections-user">
              <div className="detail-section-user">
                <h3><FiUser /> Información Personal</h3>
                <div className="detail-info-user">
                  <div className="detail-row-user">
                    <span className="detail-label-user">Nombre completo:</span>
                    <span className="detail-value-user">{selectedUser.nombre}</span>
                  </div>
                  <div className="detail-row-user">
                    <span className="detail-label-user">Email:</span>
                    <span className="detail-value-user">{selectedUser.email}</span>
                  </div>
                  <div className="detail-row-user">
                    <span className="detail-label-user">Teléfono:</span>
                    <span className="detail-value-user">{selectedUser.telefono}</span>
                  </div>
                  <div className="detail-row-user">
                    <span className="detail-label-user">Dirección:</span>
                    <span className="detail-value-user">{selectedUser.direccion}</span>
                  </div>
                </div>
              </div>

              {selectedUser.rol === 'cliente' && (
                <div className="detail-section-user">
                  <h3><FiTrendingUp /> Estadísticas de Cliente</h3>
                  <div className="detail-stats-grid">
                    <div className="detail-stat-card">
                      <div className="detail-stat-icon">
                        <FiShoppingBag />
                      </div>
                      <div className="detail-stat-content">
                        <div className="detail-stat-value">{selectedUser.total_citas}</div>
                        <div className="detail-stat-label">Total de Citas</div>
                      </div>
                    </div>
                    <div className="detail-stat-card">
                      <div className="detail-stat-icon">
                        <FiDollarSign />
                      </div>
                      <div className="detail-stat-content">
                        <div className="detail-stat-value">{formatPrice(selectedUser.total_gastado)}</div>
                        <div className="detail-stat-label">Total Gastado</div>
                      </div>
                    </div>
                    <div className="detail-stat-card">
                      <div className="detail-stat-icon">
                        <FiClock />
                      </div>
                      <div className="detail-stat-content">
                        <div className="detail-stat-value">
                          {selectedUser.ultima_cita ? formatDate(selectedUser.ultima_cita) : 'N/A'}
                        </div>
                        <div className="detail-stat-label">Última Cita</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.rol === 'terapeuta' && (
                <div className="detail-section-user">
                  <h3><FiTrendingUp /> Estadísticas de Terapeuta</h3>
                  <div className="detail-stats-grid">
                    <div className="detail-stat-card">
                      <div className="detail-stat-icon">
                        <FiCalendar />
                      </div>
                      <div className="detail-stat-content">
                        <div className="detail-stat-value">{selectedUser.total_citas}</div>
                        <div className="detail-stat-label">Sesiones Realizadas</div>
                      </div>
                    </div>
                    <div className="detail-stat-card">
                      <div className="detail-stat-icon">
                        <FiStar />
                      </div>
                      <div className="detail-stat-content">
                        <div className="detail-stat-value">4.8</div>
                        <div className="detail-stat-label">Valoración Promedio</div>
                      </div>
                    </div>
                    <div className="detail-stat-card">
                      <div className="detail-stat-icon">
                        <FiClock />
                      </div>
                      <div className="detail-stat-content">
                        <div className="detail-stat-value">
                          {selectedUser.ultima_cita ? formatDate(selectedUser.ultima_cita) : 'N/A'}
                        </div>
                        <div className="detail-stat-label">Última Sesión</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="detail-section-user">
                <h3><FiCalendar /> Información del Sistema</h3>
                <div className="detail-info-user">
                  <div className="detail-row-user">
                    <span className="detail-label-user">Fecha de registro:</span>
                    <span className="detail-value-user">{formatDate(selectedUser.fecha_registro)}</span>
                  </div>
                  <div className="detail-row-user">
                    <span className="detail-label-user">ID de usuario:</span>
                    <span className="detail-value-user">#{selectedUser.id}</span>
                  </div>
                  <div className="detail-row-user">
                    <span className="detail-label-user">Rol:</span>
                    <span className="detail-value-user">{getRoleInfo(selectedUser.rol).label}</span>
                  </div>
                  <div className="detail-row-user">
                    <span className="detail-label-user">Estado:</span>
                    <span className="detail-value-user">
                      {selectedUser.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions-user">
              <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>
                Cerrar
              </button>
              <button className="btn btn-primary" onClick={() => {
                setShowDetailModal(false)
                handleOpenModal(selectedUser)
              }}>
                <FiEdit2 />
                Editar Usuario
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmActionHandler}
        title={confirmAction?.type === 'delete' ? 'Eliminar Usuario' : 'Cambiar Estado'}
        message={
          confirmAction?.type === 'delete'
            ? `¿Estás seguro de eliminar al usuario "${selectedUser?.nombre}"? Esta acción no se puede deshacer.`
            : `¿Confirmas ${selectedUser?.activo ? 'desactivar' : 'activar'} al usuario "${selectedUser?.nombre}"?`
        }
        type={confirmAction?.type === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  )
}

export default AdminUsersPage