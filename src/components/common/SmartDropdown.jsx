import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiMoreVertical } from 'react-icons/fi'

const SmartDropdown = ({ children, trigger }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, direction: 'bottom' })
  const triggerRef = useRef(null)

  const calculatePosition = () => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const dropdownHeight = 400
    
    const direction = spaceBelow < dropdownHeight ? 'top' : 'bottom'
    
    const pos = {
      left: rect.right - 220, // 220px es el ancho del dropdown
      direction
    }

    if (direction === 'top') {
      pos.top = rect.top - 8
    } else {
      pos.top = rect.bottom + 8
    }

    setPosition(pos)
  }

  const handleToggle = () => {
    if (!isOpen) {
      calculatePosition()
    }
    setIsOpen(!isOpen)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
        const dropdown = document.querySelector('.dropdown-smart-portal')
        if (dropdown && !dropdown.contains(event.target)) {
          setIsOpen(false)
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleClose, true)
      window.addEventListener('resize', handleClose)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleClose, true)
      window.removeEventListener('resize', handleClose)
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={triggerRef}
        className="dropdown-smart-trigger"
        onClick={handleToggle}
        type="button"
      >
        {trigger || <FiMoreVertical />}
      </button>
      
      {isOpen && createPortal(
        <div 
          className={`dropdown-smart-portal direction-${position.direction}`}
          style={{
            position: 'fixed',
            top: position.direction === 'top' ? 'auto' : `${position.top}px`,
            bottom: position.direction === 'top' ? `${window.innerHeight - position.top}px` : 'auto',
            left: `${position.left}px`,
            zIndex: 9999
          }}
          onClick={handleClose}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  )
}

export default SmartDropdown