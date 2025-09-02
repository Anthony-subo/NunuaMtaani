import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/dashboard.css"; // reuse your color scheme

function NunuaMtaaniLanding() {
  const [policyChecked, setPolicyChecked] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const navigate = useNavigate();

  // Use URLs to public folder images instead of imports
  const galleryImages = [
    "/uploads/nunua.jpg",
    "/uploads/nunua2.jpg",
    "/uploads/nunua3.jpg",
    "/uploads/nunua4.jpg",
    "/uploads/nunua5.jpg",
    "/uploads/nunua5.jpg",
  ];

  const handleContinue = () => {
    if (policyChecked) {
      navigate("/register");
    } else {
      alert("⚠️ Please accept the policy before continuing.");
    }
  };

  return (
    <div className="landing-page bg-light text-dark">
      {/* Header */}
      <header className="bg-white border-bottom shadow-sm">
        <div className="container d-flex justify-content-between align-items-center py-3">
          <h3 className="fw-bold text-primary m-0">NunuaMtaani</h3>
          <nav>
            <button
              className="btn btn-success ms-3"
              onClick={() => setShowPolicy(true)}
            >
              Policy & Continue
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-5 text-center">
        <h1 className="fw-bold display-5 text-success">
          Buy Local. Support Neighbours. Save Time.
        </h1>
        <p className="text-muted mt-3">
          NunuaMtaani connects buyers with nearby shops and vendors. Shop smarter,
          support local business, and get faster deliveries.
        </p>
        <div className="mt-4">
          <a href="#gallery" className="btn btn-primary me-2">
            Explore Gallery
          </a>
          <button
            onClick={() => setShowPolicy(true)}
            className="btn btn-outline-success"
          >
            Read Policy
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-5">
        <h2 className="fw-bold text-center mb-4">What We Offer</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-3">
            <div className="p-4 border rounded shadow-sm h-100">
              <h5 className="fw-semibold text-primary">Local-first Listings</h5>
              <p className="text-muted">
                See goods and services near you so delivery is cheaper and faster.
              </p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="p-4 border rounded shadow-sm h-100">
              <h5 className="fw-semibold text-success">Trusted Riders</h5>
              <p className="text-muted">
                Track deliveries and communicate with riders in real time.
              </p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="p-4 border rounded shadow-sm h-100">
              <h5 className="fw-semibold text-warning">Easy Seller Onboarding</h5>
              <p className="text-muted">
                Simple forms and quick approvals for entrepreneurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="bg-white py-5 border-top">
        <div className="container">
          <h2 className="fw-bold text-center mb-4">How It Works</h2>
          <ol className="list-group list-group-numbered">
            <li className="list-group-item">Sign up and set your location.</li>
            <li className="list-group-item">Browse nearby shops or search products.</li>
            <li className="list-group-item">Place an order and choose delivery/pickup.</li>
            <li className="list-group-item">Track the rider and confirm delivery with a code.</li>
          </ol>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="container py-5">
        <h2 className="fw-bold text-center mb-4">Community Gallery</h2>
        <div className="row g-3">
          {galleryImages.map((img, i) => (
            <div key={i} className="col-md-4">
              <img
                src={img}
                alt={`NunuaMtaani screenshot ${i + 1}`}
                className="img-fluid rounded shadow-sm"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Policy Section */}
      <section className="bg-light py-5 border-top">
        <div className="container text-center">
          <h4 className="fw-bold">Before You Continue</h4>
          <p className="text-muted">Please accept our policy to use NunuaMtaani.</p>
          <div className="form-check d-inline-flex align-items-center">
            <input
              className="form-check-input me-2"
              type="checkbox"
              checked={policyChecked}
              onChange={(e) => setPolicyChecked(e.target.checked)}
            />
            <label className="form-check-label">
              I agree to the NunuaMtaani policy
            </label>
          </div>
          <div className="mt-3">
            <button
              className={`btn ${policyChecked ? "btn-success" : "btn-secondary disabled"}`}
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
            {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          {/* Right - Personal Details */}
          <div className="footer-box right-box text-center text-md-end">
            <h5 className="mb-1">Anthony Subo</h5>
            <p className="mb-1 small">
              Building digital experiences with passion and precision
            </p>
            <p className="mb-2 small">Crafting Code. Creating Impact.</p>

            <div className="footer-socials">
              <a
                href="https://github.com/Anthony-subo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white me-3"
                title="GitHub"
              >
                💻 GitHub
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
                title="Portfolio"
              >
                🌐 Portfolio
              </a>
            </div>
          </div>
        </div>
      </footer>


      {/* Policy Modal */}
      {showPolicy && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">NunuaMtaani Policy</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPolicy(false)}
                ></button>
              </div>
              <div className="modal-body text-start">
                <p>By using NunuaMtaani, you agree to:</p>
                <ul>
                  <li>Respect local sellers, buyers, and the NunuaMtaani community at all times.</li>
                  <li>Provide only accurate and truthful information when creating accounts, listing products, or making purchases.</li>
                  <li>
                    Do not misuse, share, or sell buyer/seller personal data — all data is protected under the Kenya Data Protection Act, 2019.
                  </li>
                  <li>
                    Understand that NunuaMtaani is a digital platform and is not liable for disputes, fraud, or delivery issues between buyers and sellers.
                  </li>
                  <li>
                    Accept that shops or accounts violating rules, failing to make required payments, or engaging in unlawful practices may be suspended or terminated without prior notice.
                  </li>
                  <li>
                    By continuing to use NunuaMtaani, you agree that the platform may update these terms and policies at any time in compliance with Kenyan law.
                  </li>
                </ul>

                <p className="small text-muted">
                  This is a summary. For the full policy, download and read our{" "}
                  <a
                    href="/NunuaMtaani_Comprehensive_Policy.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Comprehensive Legal Policy (PDF)
                  </a>.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPolicy(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NunuaMtaaniLanding;
