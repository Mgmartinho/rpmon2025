import { useState, useEffect, useRef } from 'react';

/**
 * Componente de imagem com lazy loading
 * Carrega a imagem apenas quando estiver visível no viewport
 */
const LazyImage = ({ 
  src, 
  alt, 
  placeholder = '/placeholder.png',
  className = '',
  style = {},
  threshold = 0.01,
  rootMargin = '50px',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    // Verificar se IntersectionObserver está disponível
    if (!window.IntersectionObserver) {
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            if (imageRef.current) {
              observer.unobserve(imageRef.current);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <img
      ref={imageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
      style={{
        ...style,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0.7,
      }}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
};

export default LazyImage;
