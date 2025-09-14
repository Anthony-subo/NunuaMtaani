// src/assets/pages/home.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "seller":
          navigate("/seller-dashboard");
          break;
        case "rider":
          navigate("/rider-dashboard");
          break;
        case "buyer":
          navigate("/buyer-dashboard");
          break;
        default:
          navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="container mt-4">
      <h2>Redirecting...</h2>
    </div>
  );
}

export default Home;
