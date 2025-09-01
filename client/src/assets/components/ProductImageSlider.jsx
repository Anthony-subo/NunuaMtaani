import { useState } from "react";
import "../styles/productSlider.css";

function ProductImageSlider({ productId, imageCount = 1 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!productId) {
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
    setCurrentIndex((prev) => (prev + 1) % imageCount);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + imageCount) % imageCount);
  };

  // Build image URL from backend route
  const getImageSrc = (index) =>
    `${import.meta.env.VITE_API_URL}/api/products/${productId}/image/${index}`;

  return (
    <div className="slider-wrapper">
      <img
        src={getImageSrc(currentIndex)}
        className="slider-image"
        alt={`Product image ${currentIndex + 1}`}
        onError={(e) => {
          e.target.src = "/placeholder.png"; // fallback
        }}
      />

      {imageCount > 1 && (
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
