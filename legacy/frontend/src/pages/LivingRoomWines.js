import React, { useState } from 'react';
import './LivingRoomWines.css';

function LivingRoomWines() {
  const [selectedTier, setSelectedTier] = useState(null);
  const [tier1Preference, setTier1Preference] = useState('1 of Each');
  const [frequency, setFrequency] = useState('Monthly');

  const tiers = {
    tier1: {
      name: 'Tier 1',
      price: 49,
      bottles: 2,
      features: [
        '2 bottles per delivery',
        'Choose: 2 White | 2 Red | 1 of Each',
        '10% off wines by the glass',
        'Waived corkage fees',
        'Monthly tastings'
      ]
    },
    tier2: {
      name: 'Tier 2',
      price: 89,
      bottles: 4,
      features: [
        '4 bottles (2 reds + 2 whites)',
        '10% off wines by glass AND retail',
        'Waived corkage fees',
        'Monthly tastings',
        'Priority access to special events'
      ]
    }
  };

  const frequencies = ['Monthly', '3-Month', '6-Month', 'Annual'];

  const calculatePrice = (basePrice, freq) => {
    if (freq === 'Annual') {
      return basePrice * 12;
    }
    return basePrice;
  };

  return (
    <div className="living-room-wines">
      {/* Header */}
      <header className="lrw-header">
        <div className="lrw-logo">
          <h1>Living Room Wines</h1>
          <p className="lrw-location">University Park · Portland, OR</p>
        </div>
        <nav className="lrw-nav">
          <a href="#club">Wine Club</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="lrw-hero">
        <div className="lrw-hero-content">
          <h2>Join the Wine Club</h2>
          <p>Curated selections delivered monthly. Support local. Drink well.</p>
        </div>
      </section>

      {/* Wine Club Tiers */}
      <section className="lrw-tiers" id="club">
        <h2 className="section-title">Choose Your Membership</h2>

        <div className="tiers-grid">
          {/* Tier 1 */}
          <div className={`tier-card ${selectedTier === 'tier1' ? 'selected' : ''}`}>
            <div className="tier-header">
              <h3>{tiers.tier1.name}</h3>
              <div className="tier-price">
                ${calculatePrice(tiers.tier1.price, frequency)}
                <span className="tier-period">/{frequency === 'Annual' ? 'year' : 'month'}</span>
              </div>
            </div>

            <ul className="tier-features">
              {tiers.tier1.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            {selectedTier === 'tier1' && (
              <div className="tier-options">
                <label>Wine Preference:</label>
                <select
                  value={tier1Preference}
                  onChange={(e) => setTier1Preference(e.target.value)}
                  className="tier-select"
                >
                  <option>2 White Wines</option>
                  <option>2 Red Wines</option>
                  <option>1 of Each</option>
                </select>
              </div>
            )}

            <button
              className={`tier-button ${selectedTier === 'tier1' ? 'selected' : ''}`}
              onClick={() => setSelectedTier(selectedTier === 'tier1' ? null : 'tier1')}
            >
              {selectedTier === 'tier1' ? 'Selected ✓' : 'Select Tier 1'}
            </button>
          </div>

          {/* Tier 2 */}
          <div className={`tier-card featured ${selectedTier === 'tier2' ? 'selected' : ''}`}>
            <div className="tier-badge">Most Popular</div>
            <div className="tier-header">
              <h3>{tiers.tier2.name}</h3>
              <div className="tier-price">
                ${calculatePrice(tiers.tier2.price, frequency)}
                <span className="tier-period">/{frequency === 'Annual' ? 'year' : 'month'}</span>
              </div>
            </div>

            <ul className="tier-features">
              {tiers.tier2.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            {selectedTier === 'tier2' && (
              <div className="tier-options">
                <p className="tier-note">✓ Fixed selection: 2 reds + 2 whites</p>
              </div>
            )}

            <button
              className={`tier-button ${selectedTier === 'tier2' ? 'selected' : ''}`}
              onClick={() => setSelectedTier(selectedTier === 'tier2' ? null : 'tier2')}
            >
              {selectedTier === 'tier2' ? 'Selected ✓' : 'Select Tier 2'}
            </button>
          </div>
        </div>

        {/* Frequency Selector */}
        <div className="frequency-selector">
          <label>Delivery Frequency:</label>
          <div className="frequency-buttons">
            {frequencies.map((freq) => (
              <button
                key={freq}
                className={`frequency-button ${frequency === freq ? 'active' : ''}`}
                onClick={() => setFrequency(freq)}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        {selectedTier && (
          <div className="checkout-cta">
            <button className="checkout-button">
              Continue to Checkout →
            </button>
            <p className="checkout-note">
              Currently paying 10% commission on Table22? Switch to CODEC and keep 100%.
            </p>
          </div>
        )}
      </section>

      {/* Member Reviews Section */}
      <section className="lrw-reviews">
        <h2 className="section-title">What Our Members Say</h2>
        <div className="reviews-grid">
          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              "Best wine selection in Portland. Love the monthly tastings and the staff recommendations."
            </p>
            <p className="review-author">— Sarah M.</p>
          </div>
          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              "Tier 2 membership pays for itself. The special events alone are worth it."
            </p>
            <p className="review-author">— James K.</p>
          </div>
          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              "University Park's hidden gem. Cozy atmosphere and incredible wine selection."
            </p>
            <p className="review-author">— Maria R.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="lrw-about" id="about">
        <h2 className="section-title">About Living Room Wines</h2>
        <div className="about-content">
          <p>
            Located in the heart of University Park, Living Room Wines is Portland's neighborhood
            wine bar where community meets craft. We curate exceptional wines from around the world
            and celebrate local producers.
          </p>
          <p>
            Our wine club members enjoy exclusive access to limited releases, priority event seating,
            and member-only tastings. Plus, we also have Living Room Coffee next door — ask about
            our combo membership!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="lrw-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Living Room Wines</h4>
            <p>University Park, Portland</p>
            <p>hello@livingroomwines.com</p>
          </div>
          <div className="footer-section">
            <h4>Also Try</h4>
            <p>Living Room Coffee</p>
            <p>Ask about combo memberships</p>
          </div>
          <div className="footer-section">
            <h4>Powered By</h4>
            <p>CODEC · Promise Engine</p>
            <p className="footer-note">0% commission. Keep 100% of your revenue.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Demo storefront · Live on Table22, migrating to CODEC</p>
        </div>
      </footer>
    </div>
  );
}

export default LivingRoomWines;
