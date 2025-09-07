import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Verificat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (token && email) {
      axios
  .post(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, { token, email })
  .then(res => {
    setMessage("✅ " + res.data.message);
    setTimeout(() => navigate("/login"), 2500);
  })
  .catch(err => {
    console.error(err);
    setMessage("❌ Verification failed. Try again or contact support.");
  });

    } else {
      setMessage("❌ Invalid verification link.");
    }
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h3>{message}</h3>
    </div>
  );
}

export default Verificat;
