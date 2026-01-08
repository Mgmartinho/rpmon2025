import { useState, useEffect, useRef } from 'react';

/**
 * Componente de áudio com lazy loading
 * Carrega o arquivo apenas quando necessário
 */
const LazyAudio = ({ 
  src, 
  preload = 'none',
  controls = true,
  className = '',
  onLoadStart,
  onError,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const handleLoadStart = (e) => {
    setIsLoading(true);
    if (onLoadStart) onLoadStart(e);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = (e) => {
    setError('Erro ao carregar áudio');
    setIsLoading(false);
    if (onError) onError(e);
  };

  return (
    <div className={`lazy-audio-wrapper ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        controls={controls}
        preload={preload}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onError={handleError}
        {...props}
      />
      {isLoading && (
        <div className="audio-loading">
          <small>Carregando áudio...</small>
        </div>
      )}
      {error && (
        <div className="audio-error">
          <small style={{ color: 'red' }}>{error}</small>
        </div>
      )}
    </div>
  );
};

export default LazyAudio;
