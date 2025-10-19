useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("✅ Browser GPS working:", pos.coords);
      },
      (err) => {
        console.error("❌ GPS error:", err);
      },
      { enableHighAccuracy: true }
    );
  } else {
    console.warn("⚠️ Geolocation not supported in this browser");
  }
}, []);
