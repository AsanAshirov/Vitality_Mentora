import React from 'react'
import hrData from '../hrData'
import type { Employee } from '../hrTypes'

interface AvatarProps {
  id: number
  size?: number
  status?: string
  className?: string
}

export default function Avatar({ id, size = 32, status, className = '' }: AvatarProps) {
  const e: Employee | typeof hrData.HR_USER =
    hrData.EMPLOYEES.find(x => x.id === id) || hrData.HR_USER
  const fs = Math.round(size * 0.36)
  return (
    <div className="av-wrap" style={{ width: size, height: size, position: 'relative', flex: `0 0 ${size}px` }}>
      <div
        className={'av ' + (e.avClass || hrData.avClassFromId(id || 0)) + ' ' + className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontSize: fs,
          fontWeight: 500,
          color: 'white',
        }}
      >
        {e.initials || hrData.initials(e.name)}
      </div>
      {status ? <span className={'dot ' + status} /> : null}
    </div>
  )
}
