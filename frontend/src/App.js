import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Uses standard React styling

function App() {
  const [formData, setFormData] = useState({
    make: 'Toyota',
    model: 'Belta',
    year: 2007,
    mileage: 159000,
    gear: 'Automatic',
    fuelType: 'Petrol',
    engineCc: 1300,
    condition: 'Registered (Used)',
    location: ''
  });

  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatLkr = (value) => {
    if (value === null || value === undefined) return '—';
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return '—';
    return `Rs. ${numericValue.toLocaleString()}`;
  };

const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🔽 CHANGE THIS LINE FROM: const response = await axios.post('/api/evaluate-car', formData);
      // 🔽 TO YOUR LIVE NODE BACKEND URL:
      const response = await axios.post('https://car-price-predictor-live.onrender.com/api/evaluate-car', formData);
      
      setValuation(response.data);
    } catch (err) {
      const backendMessage = err?.response?.data?.error;
      const status = err?.response?.status;
      alert(
        backendMessage
          ? `Request failed (HTTP ${status}): ${backendMessage}`
          : 'Backend connection failed. Ensure the Node server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="AppShell">
      <header className="TopBar">
        <div className="TopBar-inner">
          <div className="Brand">
            <div className="Brand-mark" aria-hidden="true" />
            <div className="Brand-text">
              <div className="Brand-subtitle">AI Valuation</div>
            </div>
          </div>
          <div className="TopBar-meta">Sri Lanka · Car price estimate</div>
        </div>
      </header>

      <main className="Page">
        <section className="Hero">
          <h1 className="Hero-title">V7 AI Price Predictor</h1>
        </section>

        <section className="Card" aria-label="Valuation form">
          <form onSubmit={handlePredict} className="Form">
            <div className="FieldGrid">
              <label className="Field">
                <span className="Field-label">Make</span>
                <select name="make" value={formData.make} onChange={handleChange}>
                  <option value="Toyota">Toyota</option>
                  <option value="Suzuki">Suzuki</option>
                  <option value="Honda">Honda</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Mitsubishi">Mitsubishi</option>
                </select>
              </label>

              <label className="Field">
                <span className="Field-label">Model</span>
                <input
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Belta"
                  autoComplete="off"
                />
              </label>

              <label className="Field">
                <span className="Field-label">Year</span>
                <input
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  inputMode="numeric"
                />
              </label>

              <label className="Field">
                <span className="Field-label">Mileage</span>
                <input
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  inputMode="numeric"
                />
              </label>

              <label className="Field">
                <span className="Field-label">Gear</span>
                <select name="gear" value={formData.gear} onChange={handleChange}>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </label>

              <label className="Field">
                <span className="Field-label">Fuel type</span>
                <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </label>

              <label className="Field">
                <span className="Field-label">Engine (cc)</span>
                <input
                  name="engineCc"
                  type="number"
                  value={formData.engineCc}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder="e.g. 1300"
                />
              </label>

              <label className="Field Field-span2">
                <span className="Field-label">Condition</span>
                <select name="condition" value={formData.condition} onChange={handleChange}>
                  <option value="Unregistered (Recondition)">Unregistered (Recondition)</option>
                  <option value="Registered (Used)">Registered (Used)</option>
                </select>
              </label>
            </div>

            <div className="FormActions">
              <button className="PrimaryButton" type="submit" disabled={loading}>
                <span className="PrimaryButton-label">
                  {loading ? 'Calculating…' : 'Generate valuation'}
                </span>
              </button>
              <div className="FormHint" aria-live="polite">
                {loading ? 'Contacting valuation service…' : 'No signup. No clutter. Just the estimate.'}
              </div>
            </div>
          </form>
        </section>

        {valuation && (
          <section className="Card Results" aria-label="Valuation results">
            <div className="ResultsHeader">
              <div>
                <h2 className="ResultsTitle">Valuation</h2>
                <div className="ResultsSub">
                  {valuation.year} {valuation.make} {valuation.model} · {valuation.status}
                </div>
              </div>
              <div className="ResultsBadge">LKR</div>
            </div>

            <div className="StatsGrid">
              <div className="Stat">
                <div className="StatLabel">Target price</div>
                <div className="StatValue">{formatLkr(valuation.target_price)}</div>
              </div>
              <div className="Stat">
                <div className="StatLabel">Great deal (buy)</div>
                <div className="StatValue">{formatLkr(valuation.great_deal)} <span className="StatSuffix">or less</span></div>
              </div>
              <div className="Stat">
                <div className="StatLabel">Overpriced (walk)</div>
                <div className="StatValue">{formatLkr(valuation.overpriced)} <span className="StatSuffix">or more</span></div>
              </div>
            </div>
          </section>
        )}

        <footer className="Footer">
          <div className="Footer-inner">
            <span className="Footer-muted">V7 AI Price Predictor</span>
            <span className="Footer-dot" aria-hidden="true">·</span>
            <span className="Footer-muted">Built for fast estimates</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
