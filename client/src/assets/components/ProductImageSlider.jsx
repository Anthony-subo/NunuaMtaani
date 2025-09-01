import { useState } from "react";
import "../styles/productSlider.css";

function ProductImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Backend base URL from .env
  const API_URL = import.meta.env.VITE_API_URL;

  // Limit to at most 4 images
  const displayImages = images?.slice(0, 4) || [];

  if (displayImages.length === 0) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-light"
        style={{ height: "200px", color: "#888" }}
      >
        No image
      </div>
    );
  }

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length
    );
  };

  return (
    <div className="slider-wrapper">
      <img
        src={`${API_URL}/uploads/${displayImages[currentIndex]}`}
        className="slider-image"
        alt={`Product image ${currentIndex + 1}`}
        onError={(e) => {
          e.target.src = "/placeholder.png"; // fallback image in /public
        }}
      />

      {displayImages.length > 1 && (
        <>
          <button className="slider-btn left" onClick={prev}>
            ‹
          </button>
          <button className="slider-btn right" onClick={next}>
            ›
          </button>
        </>
      )}
    </div>
  );
}

export default ProductImageSlider;
