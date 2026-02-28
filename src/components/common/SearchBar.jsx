import React, { useState, useEffect } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { debounce } from '../../utils/helpers'
import './SearchBar.css'

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Buscar...', 
  delay = 500,
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Debounce para evitar múltiples búsquedas
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      onSearch(searchTerm)
    }, delay)

    debouncedSearch()
  }, [searchTerm])

  const handleClear = () => {
    setSearchTerm('')
    onSearch('')
  }

  return (
    <div className={`search-bar ${className}`}>
      <FiSearch className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button className="search-clear" onClick={handleClear}>
          <FiX />
        </button>
      )}
    </div>
  )
}

export default SearchBar