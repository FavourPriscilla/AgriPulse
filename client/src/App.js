import React, { useState, useEffect } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'login'
  const [userAccount, setUserAccount] = useState(null); // Stores registered user
  
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [authError, setAuthError] = useState('');
  const [currentPage, setCurrentPage] = useState('login');

  const [weather, setWeather] = useState({
    temperature: '--',
    humidity: '--',
    precipitation: '--',
    condition: 'Loading weather...',
    bg: '#fef3c7',
    color: '#92400e'
  });
  
  const [plots, setPlots] = useState([
    { id: '1', name: 'Plot A', crop: 'Maize', stage: 'Vegetative' },
    { id: '2', name: 'Plot B', crop: 'Beans', stage: 'Flowering' }
  ]);
  const [plotForm, setPlotForm] = useState({ name: '', crop: '', stage: 'Vegetative' });

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

          setWeather({ temperature: temp, humidity, precipitation: precip, condition, bg, color });
        }
      })
      .catch(() => {
        setWeather({ temperature: '26', humidity: '78', precipitation: '0', condition: 'Moderate Risk', bg: '#fef3c7', color: '#92400e' });
      });
  }, []);

  // Handle Account Registration
  const handleSignUp = (e) => {
    e.preventDefault();
    setAuthError('');

    if (authForm.password !== authForm.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    // Save registered user details
    const newUser = {
      name: authForm.name,
      email: authForm.email,
      password: authForm.password
    };

    setUserAccount(newUser);
    alert('Account created successfully! You can now log in.');
    setAuthMode('login');
    setAuthForm({ name: '', email: newUser.email, password: '', confirmPassword: '' });
  };

  // Handle Login Authentication
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!userAccount) {
      setAuthError('No registered account found. Please sign up first.');
      return;
    }

    if (authForm.email === userAccount.email && authForm.password === userAccount.password) {
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
    } else {
      setAuthError('Invalid email or password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleAddPlot = (e) => {
    e.preventDefault();
    setPlots([...plots, { id: Date.now().toString(), ...plotForm }]);
    setPlotForm({ name: '', crop: '', stage: 'Vegetative' });
    alert('Plot added successfully!');
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
      .catch(() => {
        setExpenses([newExpense, ...expenses]);
        setSubmittedExpense(true);
        setTimeout(() => setSubmittedExpense(false), 3000);
      });
  };

  return (
    <div>
      {/* Top Header */}
      <header className="app-header">
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🌱 AgriPulse Portal</h1>
          <p style={{ fontSize: '12px', color: '#a7f3d0', margin: 0 }}>Uganda Farm Management System</p>
        </div>

        {/* 5 Navigation Tabs */}
        <nav className="nav-tabs">
          <button className={`nav-btn ${currentPage === 'login' ? 'active' : ''}`} onClick={() => setCurrentPage('login')}>
            1. Auth / Access
          </button>
          <button className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
            2. Dashboard
          </button>
          <button className={`nav-btn ${currentPage === 'plots' ? 'active' : ''}`} onClick={() => setCurrentPage('plots')}>
            3. Plots
          </button>
          <button className={`nav-btn ${currentPage === 'weather' ? 'active' : ''}`} onClick={() => setCurrentPage('weather')}>
            4. Weather & Advisory
          </button>
          <button className={`nav-btn ${currentPage === 'expenses' ? 'active' : ''}`} onClick={() => setCurrentPage('expenses')}>
            5. Expenses
          </button>

          {isLoggedIn && (
            <button 
              onClick={handleLogout}
              style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', marginLeft: '12px', cursor: 'pointer' }}
            >
              Logout
            </button>
          )}
        </nav>
      </header>

      <main className="main-container">

        {/* PAGE 1: AUTHENTICATION (SIGN UP & LOGIN) */}
        {currentPage === 'login' && (
          <div className="page-card" style={{ maxWidth: '440px', margin: '30px auto' }}>
            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
              <button 
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: authMode === 'signup' ? '3px solid #059669' : 'none', fontWeight: 'bold', color: authMode === 'signup' ? '#059669' : '#64748b', cursor: 'pointer' }}
              >
                Create Account
              </button>
              <button 
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: authMode === 'login' ? '3px solid #059669' : 'none', fontWeight: 'bold', color: authMode === 'login' ? '#059669' : '#64748b', cursor: 'pointer' }}
              >
                Log In
              </button>
            </div>

            {authError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
                ⚠️ {authError}
              </div>
            )}

            {isLoggedIn ? (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                ✓ Welcome back, {userAccount ? userAccount.name : 'Farmer'}!
                <button onClick={() => setCurrentPage('dashboard')} className="btn-primary" style={{ marginTop: '12px', width: '100%' }}>
                  Proceed to Dashboard
                </button>
              </div>
            ) : authMode === 'signup' ? (
              /* SIGN UP FORM */
              <form onSubmit={handleSignUp}>
                <div className="form-group">
                  <label className="form-label">Full Name / Farm Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Mukasa" 
                    value={authForm.name}
                    onChange={e => setAuthForm({...authForm, name: e.target.value})}
                    className="form-control"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="farmer@agripulse.ug" 
                    value={authForm.email}
                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                    className="form-control"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={authForm.password}
                    onChange={e => setAuthForm({...authForm, password: e.target.value})}
                    className="form-control"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={authForm.confirmPassword}
                    onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})}
                    className="form-control"
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  Register Account
                </button>
              </form>
            ) : (
              /* LOGIN FORM */
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Registered Email</label>
                  <input 
                    type="email" 
                    placeholder="farmer@agripulse.ug" 
                    value={authForm.email}
                    onChange={e => setAuthForm({...authForm, email: e.target.value})}
                    className="form-control"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={authForm.password}
                    onChange={e => setAuthForm({...authForm, password: e.target.value})}
                    className="form-control"
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  Log In
                </button>
              </form>
            )}
          </div>
        )}

        {/* PAGE 2: DASHBOARD */}
        {currentPage === 'dashboard' && (
          <div className="page-card">
            <h2 className="page-title">📊 Farm Overview Dashboard</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              Welcome back, <strong>{userAccount ? userAccount.name : 'Farmer'}</strong>! Here is a high-level summary of your farm operations.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span className="form-label">Active Plots</span>
                <strong style={{ fontSize: '24px', color: '#059669' }}>{plots.length}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span className="form-label">Current Temperature</span>
                <strong style={{ fontSize: '24px', color: '#1e293b' }}>{weather.temperature}°C</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span className="form-label">Total Expenses Logged</span>
                <strong style={{ fontSize: '24px', color: '#2563eb' }}>{expenses.length}</strong>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: weather.bg, color: weather.color, fontWeight: 'bold', fontSize: '14px' }}>
              Advisory Alert: {weather.condition}
            </div>
          </div>
        )}

        {/* PAGE 3: PLOT MANAGEMENT */}
        {currentPage === 'plots' && (
          <div className="page-card">
            <h2 className="page-title">🌾 Plot Management</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Add new farm plots or remove harvested sections.</p>
            
            <form onSubmit={handleAddPlot} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: 0 }}>Register New Plot</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Plot Name</label>
                  <input type="text" placeholder="e.g. Plot C" value={plotForm.name} onChange={e => setPlotForm({...plotForm, name: e.target.value})} className="form-control" required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Crop Type</label>
                  <input type="text" placeholder="e.g. Tomatoes" value={plotForm.crop} onChange={e => setPlotForm({...plotForm, crop: e.target.value})} className="form-control" required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Growth Stage</label>
                  <select value={plotForm.stage} onChange={e => setPlotForm({...plotForm, stage: e.target.value})} className="form-control">
                    <option value="Seedling">Seedling</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Harvesting">Harvesting</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ height: '38px' }}>Add Plot</button>
              </div>
            </form>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Active Registered Plots</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {plots.map(p => (
                <li key={p.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{p.name}</strong> - {p.crop} <span style={{ color: '#64748b', fontSize: '12px' }}>({p.stage} Stage)</span>
                  </div>
                  <button onClick={() => handleRemovePlot(p.id)} style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* PAGE 4: WEATHER & ADVISORY */}
        {currentPage === 'weather' && (
          <div className="page-card">
            <h2 className="page-title">🌤️ Weather & Pest Risk Advisory</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Real-time meteorological data pulled from Open-Meteo for regional farm planning.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span className="form-label">Temperature</span>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{weather.temperature}°C</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span className="form-label">Relative Humidity</span>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{weather.humidity}%</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span className="form-label">Precipitation</span>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{weather.precipitation} mm</span>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: weather.bg, color: weather.color }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Agricultural Risk Assessment</h3>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{weather.condition}. Ensure proper crop spacing and inspect plants regularly if humidity remains high.</p>
            </div>
          </div>
        )}

        {/* PAGE 5: EXPENSE TRACKER */}
        {currentPage === 'expenses' && (
          <div className="page-card">
            <h2 className="page-title">💰 Farm Expense Logger (UGX)</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Track production costs categorized by inputs, labor, and equipment.</p>
            
            {submittedExpense && (
              <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px' }}>
                ✓ Expense successfully recorded!
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Plot</label>
                  <select value={expenseForm.plotId} onChange={e => setExpenseForm({...expenseForm, plotId: e.target.value})} className="form-control">
                    {plots.map(p => <option key={p.id} value={p.id}>{p.name} ({p.crop})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category</label>
                  <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="form-control">
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Pesticide">Pesticide</option>
                    <option value="Labor">Labor</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Amount (UGX)</label>
                  <input type="number" placeholder="e.g. 50000" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="form-control" required />
                </div>
                <button type="submit" className="btn-primary" style={{ height: '38px' }}>Add Expense</button>
              </div>
            </form>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Logged Expense History</h3>
            {expenses.length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>No expenses logged yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {expenses.map((exp, idx) => {
                  const targetPlot = plots.find(p => p.id === exp.plotId);
                  return (
                    <li key={idx} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span>{exp.category} — <strong style={{ color: '#475569' }}>{targetPlot ? targetPlot.name : 'Plot'}</strong> ({exp.date})</span>
                      <strong style={{ color: '#047857' }}>UGX {Number(exp.amount).toLocaleString()}</strong>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;