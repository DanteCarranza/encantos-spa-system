import React from 'react'
import { useParams } from 'react-router-dom'

const ProductDetailPage = () => {
  const { id } = useParams()
  
  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <h1>Detalle del Producto #{id}</h1>
      <p>Información del producto - Por implementar</p>
    </div>
  )
}

export default ProductDetailPage