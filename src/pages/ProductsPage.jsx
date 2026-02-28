import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiShoppingCart,
  FiSearch,
  FiFilter,
  FiStar,
  FiHeart,
  FiShoppingBag,
  FiTrendingUp,
  FiPackage,
  FiCheck
} from 'react-icons/fi'
import Swal from 'sweetalert2'
import './ProductsPage.css'

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [cart, setCart] = useState([])

  const categories = [
    { value: 'all', label: 'Todos los Productos', icon: '🛍️' },
    { value: 'cuidado-capilar', label: 'Cuidado Capilar', icon: '💇‍♀️' },
    { value: 'cuidado-facial', label: 'Cuidado Facial', icon: '✨' },
    { value: 'cuidado-corporal', label: 'Cuidado Corporal', icon: '🧴' },
    { value: 'maquillaje', label: 'Maquillaje', icon: '💄' },
    { value: 'aromaterapia', label: 'Aromaterapia', icon: '🕯️' },
    { value: 'accesorios', label: 'Accesorios', icon: '🎀' }
  ]

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)

    setTimeout(() => {
      setProducts([
        {
          id: 1,
          nombre: 'Shampoo Reparador Keratina',
          descripcion: 'Shampoo profesional con keratina para cabello dañado. Repara y fortalece desde la raíz.',
          categoria: 'cuidado-capilar',
          precio: 89.90,
          precio_original: 120.00,
          descuento: 25,
          stock: 15,
          rating: 4.8,
          reviews: 124,
          imagen_url: 'https://via.placeholder.com/400x400/d946ef/ffffff?text=Shampoo+Keratina',
          nuevo: false,
          destacado: true,
          marca: 'SpaLuxe'
        },
        {
          id: 2,
          nombre: 'Crema Facial Anti-Edad',
          descripcion: 'Crema con ácido hialurónico y colágeno. Reduce líneas de expresión y rejuvenece la piel.',
          categoria: 'cuidado-facial',
          precio: 149.90,
          precio_original: 0,
          descuento: 0,
          stock: 8,
          rating: 4.9,
          reviews: 89,
          imagen_url: 'https://via.placeholder.com/400x400/a855f7/ffffff?text=Crema+Facial',
          nuevo: true,
          destacado: true,
          marca: 'BeautyPro'
        },
        {
          id: 3,
          nombre: 'Aceite Esencial de Lavanda',
          descripcion: 'Aceite 100% puro para aromaterapia. Relaja y mejora la calidad del sueño.',
          categoria: 'aromaterapia',
          precio: 45.00,
          precio_original: 0,
          descuento: 0,
          stock: 25,
          rating: 4.7,
          reviews: 156,
          imagen_url: 'https://via.placeholder.com/400x400/fbbf24/ffffff?text=Aceite+Lavanda',
          nuevo: false,
          destacado: false,
          marca: 'AromaZen'
        },
        {
          id: 4,
          nombre: 'Exfoliante Corporal Natural',
          descripcion: 'Exfoliante con sal marina y aceites naturales. Elimina células muertas y suaviza la piel.',
          categoria: 'cuidado-corporal',
          precio: 65.00,
          precio_original: 85.00,
          descuento: 24,
          stock: 12,
          rating: 4.6,
          reviews: 78,
          imagen_url: 'https://via.placeholder.com/400x400/10b981/ffffff?text=Exfoliante',
          nuevo: false,
          destacado: false,
          marca: 'NaturalSpa'
        },
        {
          id: 5,
          nombre: 'Tinte Profesional Sin Amoniaco',
          descripcion: 'Coloración permanente enriquecida con aceites. Cubre 100% las canas sin maltratar.',
          categoria: 'cuidado-capilar',
          precio: 79.90,
          precio_original: 0,
          descuento: 0,
          stock: 20,
          rating: 4.5,
          reviews: 92,
          imagen_url: 'https://via.placeholder.com/400x400/d946ef/ffffff?text=Tinte+Capilar',
          nuevo: false,
          destacado: true,
          marca: 'ColorPro'
        },
        {
          id: 6,
          nombre: 'Mascarilla Hidratante Facial',
          descripcion: 'Mascarilla en sheet con ácido hialurónico. Hidratación profunda en 15 minutos.',
          categoria: 'cuidado-facial',
          precio: 25.00,
          precio_original: 35.00,
          descuento: 29,
          stock: 50,
          rating: 4.8,
          reviews: 234,
          imagen_url: 'https://via.placeholder.com/400x400/a855f7/ffffff?text=Mascarilla',
          nuevo: true,
          destacado: false,
          marca: 'BeautyPro'
        },
        {
          id: 7,
          nombre: 'Set de Brochas Profesionales',
          descripcion: 'Set de 12 brochas para maquillaje profesional. Cerdas sintéticas de alta calidad.',
          categoria: 'accesorios',
          precio: 120.00,
          precio_original: 0,
          descuento: 0,
          stock: 10,
          rating: 4.9,
          reviews: 67,
          imagen_url: 'https://via.placeholder.com/400x400/ec4899/ffffff?text=Brochas',
          nuevo: false,
          destacado: true,
          marca: 'MakeupPro'
        },
        {
          id: 8,
          nombre: 'Loción Corporal Hidratante',
          descripcion: 'Loción con manteca de karité y vitamina E. Hidratación 24 horas con aroma delicado.',
          categoria: 'cuidado-corporal',
          precio: 55.00,
          precio_original: 70.00,
          descuento: 21,
          stock: 18,
          rating: 4.7,
          reviews: 145,
          imagen_url: 'https://via.placeholder.com/400x400/10b981/ffffff?text=Locion+Corporal',
          nuevo: false,
          destacado: false,
          marca: 'SpaLuxe'
        },
        {
          id: 9,
          nombre: 'Velas Aromáticas Premium',
          descripcion: 'Set de 3 velas con esencias naturales: lavanda, vainilla y eucalipto. 45 horas de duración.',
          categoria: 'aromaterapia',
          precio: 89.00,
          precio_original: 0,
          descuento: 0,
          stock: 15,
          rating: 4.8,
          reviews: 98,
          imagen_url: 'https://via.placeholder.com/400x400/fbbf24/ffffff?text=Velas',
          nuevo: true,
          destacado: false,
          marca: 'AromaZen'
        },
        {
          id: 10,
          nombre: 'Sérum Facial Vitamina C',
          descripcion: 'Sérum concentrado con vitamina C pura. Ilumina y unifica el tono de la piel.',
          categoria: 'cuidado-facial',
          precio: 135.00,
          precio_original: 180.00,
          descuento: 25,
          stock: 7,
          rating: 4.9,
          reviews: 176,
          imagen_url: 'https://via.placeholder.com/400x400/a855f7/ffffff?text=Serum+Vit+C',
          nuevo: true,
          destacado: true,
          marca: 'BeautyPro'
        },
        {
          id: 11,
          nombre: 'Acondicionador Nutritivo',
          descripcion: 'Acondicionador con aceite de argán y proteínas. Desenreda y nutre profundamente.',
          categoria: 'cuidado-capilar',
          precio: 79.90,
          precio_original: 0,
          descuento: 0,
          stock: 22,
          rating: 4.7,
          reviews: 112,
          imagen_url: 'https://via.placeholder.com/400x400/d946ef/ffffff?text=Acondicionador',
          nuevo: false,
          destacado: false,
          marca: 'SpaLuxe'
        },
        {
          id: 12,
          nombre: 'Paleta de Sombras Nude',
          descripcion: 'Paleta de 16 tonos nude y marrones. Altamente pigmentadas y larga duración.',
          categoria: 'maquillaje',
          precio: 95.00,
          precio_original: 130.00,
          descuento: 27,
          stock: 13,
          rating: 4.8,
          reviews: 134,
          imagen_url: 'https://via.placeholder.com/400x400/ec4899/ffffff?text=Paleta+Sombras',
          nuevo: false,
          destacado: true,
          marca: 'MakeupPro'
        }
      ])
      setLoading(false)
    }, 800)
  }

  const handleAddToCart = (product) => {
    setCart(prev => [...prev, product])
    
    Swal.fire({
      icon: 'success',
      title: '¡Agregado al Carrito!',
      text: `${product.nombre} se agregó correctamente`,
      confirmButtonColor: '#d946ef',
      timer: 2000,
      showConfirmButton: false
    })
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || product.categoria === categoryFilter
      
      let matchesPrice = true
      if (priceFilter === 'under-50') {
        matchesPrice = product.precio < 50
      } else if (priceFilter === '50-100') {
        matchesPrice = product.precio >= 50 && product.precio < 100
      } else if (priceFilter === '100-150') {
        matchesPrice = product.precio >= 100 && product.precio < 150
      } else if (priceFilter === 'over-150') {
        matchesPrice = product.precio >= 150
      }

      return matchesSearch && matchesCategory && matchesPrice
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.precio - b.precio
      if (sortBy === 'price-desc') return b.precio - a.precio
      if (sortBy === 'name-asc') return a.nombre.localeCompare(b.nombre)
      if (sortBy === 'rating') return b.rating - a.rating
      return 0 // popular (default order)
    })

  const formatPrice = (price) => {
    return `S/ ${price.toFixed(2)}`
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'}
      />
    ))
  }

  if (loading) {
    return (
      <div className="products-loading">
        <div className="spinner-large"></div>
        <p>Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="products-page">
      {/* Hero Section */}
      <section className="products-hero">
        <div className="products-hero-overlay"></div>
        <div className="floating-bubble bubble-1"></div>
        <div className="floating-bubble bubble-2"></div>
        <div className="floating-bubble bubble-3"></div>

        <div className="products-hero-content">
          <div className="hero-badge">
            <FiShoppingBag />
            <span>Tienda Online</span>
          </div>
          <h1 className="products-hero-title">Productos Premium para tu Belleza</h1>
          <p className="products-hero-subtitle">
            Descubre nuestra selección de productos profesionales para el cuidado personal
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="products-filters-section">
        <div className="products-container">
          <div className="filters-wrapper">
            <div className="search-box-products">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="filters-row-products">
              <div className="filter-group-products">
                <FiFilter />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="filter-select-products"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group-products">
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="filter-select-products"
                >
                  <option value="all">Todos los precios</option>
                  <option value="under-50">Menos de S/ 50</option>
                  <option value="50-100">S/ 50 - S/ 100</option>
                  <option value="100-150">S/ 100 - S/ 150</option>
                  <option value="over-150">Más de S/ 150</option>
                </select>
              </div>

              <div className="filter-group-products">
                <span>Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select-products"
                >
                  <option value="popular">Más Populares</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="name-asc">Nombre: A-Z</option>
                  <option value="rating">Mejor Valorados</option>
                </select>
              </div>
            </div>

            <div className="results-count">
              Mostrando <strong>{filteredProducts.length}</strong> productos
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-grid-section">
        <div className="products-container">
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                {product.nuevo && (
                  <div className="product-badge new">
                    <FiTrendingUp />
                    Nuevo
                  </div>
                )}
                {product.descuento > 0 && (
                  <div className="product-badge discount">
                    -{product.descuento}%
                  </div>
                )}

                <div className="product-image">
                  <img src={product.imagen_url} alt={product.nombre} />
                  <div className="product-overlay">
                    <button className="btn-quick-view">
                      <FiShoppingCart />
                      Vista Rápida
                    </button>
                  </div>
                </div>

                <div className="product-body">
                  <div className="product-brand">{product.marca}</div>
                  <h3 className="product-name">{product.nombre}</h3>
                  <p className="product-description">{product.descripcion}</p>

                  <div className="product-rating">
                    <div className="stars">
                      {renderStars(product.rating)}
                    </div>
                    <span className="rating-text">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  <div className="product-footer">
                    <div className="product-price">
                      {product.precio_original > 0 && (
                        <span className="price-original">{formatPrice(product.precio_original)}</span>
                      )}
                      <span className="price-current">{formatPrice(product.precio)}</span>
                    </div>

                    <button
                      className="btn-add-cart"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <FiShoppingCart />
                      {product.stock === 0 ? 'Agotado' : 'Agregar'}
                    </button>
                  </div>

                  <div className="product-stock">
                    {product.stock > 0 ? (
                      <span className="in-stock">
                        <FiCheck /> {product.stock} disponibles
                      </span>
                    ) : (
                      <span className="out-stock">Sin stock</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-state-products">
              <div className="empty-icon">🔍</div>
              <h3>No se encontraron productos</h3>
              <p>Intenta con otros filtros de búsqueda</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="products-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiPackage />
              </div>
              <h3>Envío Gratis</h3>
              <p>En compras mayores a S/ 150</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiShoppingBag />
              </div>
              <h3>Productos Originales</h3>
              <p>100% garantizado y certificado</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiHeart />
              </div>
              <h3>Devoluciones Fáciles</h3>
              <p>Hasta 30 días después de la compra</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiStar />
              </div>
              <h3>Calidad Premium</h3>
              <p>Productos profesionales de spa</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductsPage