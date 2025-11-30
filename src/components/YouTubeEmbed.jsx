import React from 'react'

export default function YouTubeEmbed({ videoId, title = 'Video', className = '' }){
  return (
    <div className={`youtube-container ${className}`}>
      <iframe
        className="youtube-iframe"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}
