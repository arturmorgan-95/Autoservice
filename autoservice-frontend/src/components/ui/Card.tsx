import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`${hover ? 'glass-card-hover' : 'glass-card'} ${className}`}>
      {children}
    </div>
  )
}
