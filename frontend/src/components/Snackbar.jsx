import React, { useEffect } from 'react'

export default function Snackbar({ message, open, actionLabel, onAction, onClose, duration=4000 }){
  useEffect(()=>{
    if(!open) return
    const t = setTimeout(()=>{ onClose && onClose() }, duration)
    return ()=>clearTimeout(t)
  },[open, duration, onClose])

  if(!open) return null
  return (
    <div className="snackbar">
      <div className="snackbar-msg">{message}</div>
      {actionLabel && <button className="snackbar-action" onClick={onAction}>{actionLabel}</button>}
      <button className="snackbar-close" onClick={onClose}>✕</button>
    </div>
  )
}