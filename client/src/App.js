import React, { useState, useEffect } from 'react';

function App() {
  const [weather, setWeather] = useState({
    temperature: '--',
    humidity: '--',
    condition: 'Loading weather...',
    bg: '#fef3c7',
    color: '#92400e'
  });
  
  const [plots, setPlots] = useState([
    { id: '1', name: 'Plot A', crop: 'Maize', stage: 'Vegetative' },
    { id: '2', name: 'Plot B', crop: 'Beans', stage: 'Flowering' }
  ]);
  const [plotForm, setPlotForm] = useState({ name: '', crop: '', stage: 'Vegetative' });
  const [showAddPlot, setShowAddPlot] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ plotId: '1', category: 'Seeds', amount: '' });
  const [submittedExpense, setSubmittedExpense] = useState(false);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=0.3476&longitude=32.5825&current=temperature_2m,relative_humidity_2m,precipitation')
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          const temp = data.current.temperature_2m;
          const humidity = data.current.relative_humidity_2m;
          const precip = data.current.precipitation;

          let condition = 'Low Blight Risk';
          let bg = '#d1fae5';
          let color = '#065f46';

          if (humidity > 80 && temp > 24) {
            condition = 'High Blight Risk (High Humidity)';
            bg = '#fee2e2';
            color = '#991b1b';
          } else if (humidity > 70 || precip > 0) {
            condition = 'Moderate Fungal / Pest Risk';
            bg = '#fef3c7';
            color = '#92400e';
          }

          setWeather({ temperature: temp, humidity: humidity, condition, bg, color });
        }
      })
      .catch(() => {
        setWeather({ temperature: '26', humidity: '78', condition: 'Moderate Risk', bg: '#fef3c7', color: '#92400e' });
      });
  }, []);

  const handleAddPlot = (e) => {
    e.preventDefault();
    setPlots([...plots, { id: Date.now().toString(), ...plotForm }]);
    setPlotForm({ name: '', crop: '', stage: 'Vegetative' });
    setShowAddPlot(false);
  };

  const handleRemovePlot = (id) => {
    setPlots(plots.filter(p => p.id !== id));
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const newExpense = { ...expenseForm, date: new Date().toLocaleDateString() };

    fetch('http://localhost:5000/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    })
      .then(res => res.json())
      .then(data => {
        setExpenses([data.data, ...expenses]);
        setSubmittedExpense(true);
        setExpenseForm({ plotId: plots[0] ? plots[0].id : '1', category: 'Seeds', amount: '' });
        setTimeout(() => setSubmittedExpense(false), 3000);
      })
      .catch(err => console.log('Expense error:', err));
  };

  return (
    <div>
      <header className="app-header">
        <h1 className="app-title">🌱 AgriPulse Farm Portal</h1>
        <p className="app-subtitle">Smart Farm Management & Advisory System • Central Region (UG)</p>
      </header>

      <main className="main-container">
        <div className="card-grid">
          
          {/* Card 1: Weather */}
          <div className="card">
            <div>
              <h3 className="card-title">🌤️ Weather & Pest Risk</h3>
              <div className="metric-box">
                <div className="metric-row">
                  <span>Temperature</span>
                  <strong>{weather.temperature}°C</strong>
                </div>
                <div className="metric-row">
                  <span>Humidity</span>
                  <strong>{weather.humidity}%</strong>
                </div>
              </div>
            </div>
            <div className="risk-badge" style={{ backgroundColor: weather.bg, color: weather.color }}>
              ⚠️ {weather.condition}
            </div>
          </div>

          {/* Card 2: Active Plots */}
          <div className="card">
            <div>
              <div className="card-title">
                <span>🌾 Active Plots</span>
                <button className="btn-secondary" onClick={() => setShowAddPlot(!showAddPlot)}>
                  {showAddPlot ? 'Cancel' : '+ Add Plot'}
                </button>
              </div>

              {showAddPlot && (
                <form onSubmit={handleAddPlot} className="metric-box">
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Plot Name (e.g. Plot C)" 
                      value={plotForm.name}
                      onChange={e => setPlotForm({...plotForm, name: e.target.value})}
                      className="form-control"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Crop Type (e.g. Tomatoes)" 
                      value={plotForm.crop}
                      onChange={e => setPlotForm({...plotForm, crop: e.target.value})}
                      className="form-control"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <select 
                      value={plotForm.stage}
                      onChange={e => setPlotForm({...plotForm, stage: e.target.value})}
                      className="form-control"
                    >
                      <option value="Seedling">Seedling Stage</option>
                      <option value="Vegetative">Vegetative Stage</option>
                      <option value="Flowering">Flowering Stage</option>
                      <option value="Harvesting">Harvesting Stage</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary">Save Plot</button>
                </form>
              )}

              <ul className="list-container">
                {plots.map(p => (
                  <li key={p.id} className="list-item">
                    <div>
                      <strong>{p.name}:</strong> {p.crop}
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Stage: {p.stage}</div>
                    </div>
                    <button className="btn-delete" onClick={() => handleRemovePlot(p.id)}>✕</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 3: Quick Log Expense */}
          <div className="card">
            <div>
              <h3 className="card-title">💰 Quick Log Expense</h3>
              
              {submittedExpense && (
                <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', marginBottom: '12px' }}>
                  ✓ Expense logged successfully!
                </div>
              )}

              <form onSubmit={handleExpenseSubmit}>
                <div className="form-group">
                  <label className="form-label">Select Plot</label>
                  <select 
                    value={expenseForm.plotId}
                    onChange={e => setExpenseForm({...expenseForm, plotId: e.target.value})}
                    className="form-control"
                  >
                    {plots.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.crop})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="form-control"
                  >
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Pesticide">Pesticide</option>
                    <option value="Labor">Labor</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (UGX)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 50000" 
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                    className="form-control"
                    required 
                  />
                </div>

                <button type="submit" className="btn-primary">Record Expense</button>
              </form>

              <div className="history-section">
                <span className="form-label">Recent History</span>
                {expenses.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', margin: '4px 0 0 0' }}>No expenses recorded yet.</p>
                ) : (
                  <ul className="list-container">
                    {expenses.map((exp, index) => {
                      const targetPlot = plots.find(p => p.id === exp.plotId);
                      return (
                        <li key={index} className="list-item">
                          <span>{exp.category} ({targetPlot ? targetPlot.name : 'Plot'})</span>
                          <strong style={{ color: '#047857' }}>UGX {Number(exp.amount).toLocaleString()}</strong>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;