import { useState, useRef } from 'react';
import '../styles/productSlider.css';

function ProductImageSlider({ images, shopName }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);

  // Show at most 4 images
  const displayImages = images?.slice(0, 4) || [];

  if (displayImages.length === 0) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-light"
        style={{ height: '220px', color: '#888', borderRadius: '12px' }}
      >
        No image
      </div>
    );
  }

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // ✅ Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (diff > 50) {
      next(); // swipe left → next
    } else if (diff < -50) {
      prev(); // swipe right → prev
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="slider-wrapper"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={displayImages[currentIndex]}
        className="slider-image"
        alt={`Product image ${currentIndex + 1}`}
      />

      {/* Floating Shop Name Overlay */}
      {shopName && (
        <div className="slider-shop-overlay">
          <span className="shop-name-text">{shopName}</span>
          <span className="verified-badge">✅</span>
        </div>
      )}

      {/* Instagram-style pagination dots */}
      {displayImages.length > 1 && (
        <div className="slider-dots">
          {displayImages.map((_, index) => (
            <span
              key={index}
              className={`dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductImageSlider;