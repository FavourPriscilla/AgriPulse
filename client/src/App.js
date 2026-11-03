import React, { useState, useEffect } from 'react';

function App() {
  const [weather, setWeather] = useState(null);
  
  // Plots State
  const [plots, setPlots] = useState([
    { id: '1', name: 'Plot A', crop: 'Maize', stage: 'Vegetative' },
    { id: '2', name: 'Plot B', crop: 'Beans', stage: 'Flowering' }
  ]);
  const [plotForm, setPlotForm] = useState({ name: '', crop: '', stage: 'Vegetative' });
  const [showAddPlot, setShowAddPlot] = useState(false);

  // Expenses State
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ 
    plotId: '1', 
    category: 'Seeds', 
    amount: '' 
  });
  const [submittedExpense, setSubmittedExpense] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/weather')
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(err => console.log('API offline, using mock state'));
  }, []);

  // Handle Adding a New Plot
  const handleAddPlot = (e) => {
    e.preventDefault();
    const newPlot = {
      id: Date.now().toString(),
      name: plotForm.name,
      crop: plotForm.crop,
      stage: plotForm.stage
    };
    setPlots([...plots, newPlot]);
    setPlotForm({ name: '', crop: '', stage: 'Vegetative' });
    setShowAddPlot(false);
  };

  // Handle Removing a Plot
  const handleRemovePlot = (id) => {
    setPlots(plots.filter(p => p.id !== id));
  };

  // Handle Expense Submission
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      plotId: expenseForm.plotId,
      category: expenseForm.category,
      amount: expenseForm.amount,
      date: new Date().toLocaleDateString()
    };

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
      .catch(err => console.log('Error posting expense', err));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-green-800">AgriPulse Portal</h1>
        <p className="text-gray-600">Web-Based Farm Management & Advisory</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-yellow-500">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Weather & Pest Risk</h3>
          <p className="text-gray-600">Temp: {weather ? weather.temperature : '28'}°C | Humidity: {weather ? weather.humidity : '75'}%</p>
          <div className="mt-3 inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded">
            {weather ? weather.condition : 'Moderate Blight Risk'}
          </div>
        </div>
        
        {/* Active Plots Management */}
        <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-green-600 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg text-gray-800">Active Plots</h3>
              <button 
                onClick={() => setShowAddPlot(!showAddPlot)}
                className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-1 rounded hover:bg-green-200"
              >
                {showAddPlot ? 'Cancel' : '+ Add Plot'}
              </button>
            </div>

            {/* Add Plot Form Modal/Drawer */}
            {showAddPlot && (
              <form onSubmit={handleAddPlot} className="bg-gray-50 p-3 rounded mb-3 border space-y-2">
                <h4 className="text-xs font-bold text-gray-700">New Plot Details</h4>
                <input 
                  type="text" 
                  placeholder="Plot Name (e.g. Plot C)" 
                  value={plotForm.name}
                  onChange={e => setPlotForm({...plotForm, name: e.target.value})}
                  className="w-full p-1.5 border rounded text-xs"
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Crop Type (e.g. Tomatoes)" 
                  value={plotForm.crop}
                  onChange={e => setPlotForm({...plotForm, crop: e.target.value})}
                  className="w-full p-1.5 border rounded text-xs"
                  required 
                />
                <select 
                  value={plotForm.stage}
                  onChange={e => setPlotForm({...plotForm, stage: e.target.value})}
                  className="w-full p-1.5 border rounded text-xs bg-white"
                >
                  <option value="Seedling">Seedling Stage</option>
                  <option value="Vegetative">Vegetative Stage</option>
                  <option value="Flowering">Flowering Stage</option>
                  <option value="Harvesting">Harvesting Stage</option>
                </select>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded text-xs font-bold shadow-sm">
                   Save Plot
                </button>
              </form>
            )}

            {/* Plots List */}
            {plots.length === 0 ? (
              <p className="text-xs text-gray-400">No active plots added.</p>
            ) : (
              <ul className="space-y-2 max-h-56 overflow-y-auto">
                {plots.map(p => (
                  <li key={p.id} className="text-xs bg-gray-50 p-2 rounded border flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-800">{p.name}:</span> {p.crop} 
                      <span className="block text-gray-500 text-[10px]">({p.stage})</span>
                    </div>
                    <button 
                      onClick={() => handleRemovePlot(p.id)}
                      className="text-red-600 hover:text-red-800 font-bold px-1.5 py-0.5 text-xs rounded bg-red-50 border border-red-200"
                      title="Remove Plot"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Log Expense Form */}
        <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-blue-600">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Quick Log Expense</h3>
          {submittedExpense && <div className="mb-2 text-xs text-green-600 font-semibold">Expense logged successfully!</div>}
          
          <form onSubmit={handleExpenseSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Select Plot</label>
              <select 
                value={expenseForm.plotId}
                onChange={e => setExpenseForm({...expenseForm, plotId: e.target.value})}
                className="w-full p-2 border rounded text-sm bg-white"
              >
                {plots.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.crop})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Expense Category</label>
              <select 
                value={expenseForm.category}
                onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                className="w-full p-2 border rounded text-sm bg-white"
              >
                <option value="Seeds">Seeds</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Pesticide">Pesticide</option>
                <option value="Labor">Labor</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (UGX)</label>
              <input 
                type="number" 
                placeholder="e.g. 50000" 
                value={expenseForm.amount}
                onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                className="w-full p-2 border rounded text-sm"
                required 
              />
            </div>

            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded text-sm font-semibold hover:bg-green-700">
              Add Expense
            </button>
          </form>

          {/* Recorded Expenses History List */}
          <div className="mt-5 border-t pt-3">
            <h4 className="font-bold text-sm text-gray-700 mb-2">Recorded Expenses History:</h4>
            {expenses.length === 0 ? (
              <p className="text-xs text-gray-400">No expenses recorded yet.</p>
            ) : (
              <ul className="space-y-2 max-h-32 overflow-y-auto">
                {expenses.map((exp, index) => {
                  const targetPlot = plots.find(p => p.id === exp.plotId);
                  return (
                    <li key={index} className="text-xs bg-gray-50 p-2 rounded border flex justify-between items-center">
                      <span>{exp.category} ({targetPlot ? targetPlot.name : 'Plot'})</span>
                      <span className="font-bold text-green-700">UGX {Number(exp.amount).toLocaleString()}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;