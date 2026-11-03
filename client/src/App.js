import React, { useState, useEffect } from 'react';

function App() {
  const [weather, setWeather] = useState(null);
  const [plots, setPlots] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ 
    plotId: '1', 
    category: 'Seeds', 
    amount: '' 
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/weather')
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(err => console.log('API offline, using mock state'));

    fetch('http://localhost:5000/api/plots')
      .then(res => res.json())
      .then(data => setPlots(data))
      .catch(err => console.log('API offline, using mock state'));
  }, []);

  const handleSubmit = (e) => {
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
        setSubmitted(true);
        setExpenseForm({ plotId: '1', category: 'Seeds', amount: '' });
        setTimeout(() => setSubmitted(false), 3000);
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
        
        {/* Active Plots */}
        <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-green-600">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Active Plots</h3>
          {plots.length > 0 ? plots.map(p => (
            <div key={p.id} className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">{p.name}:</span> {p.crop} ({p.stage} Stage)
            </div>
          )) : (
            <>
              <p className="text-gray-600 text-sm">Plot A: Maize (Vegetative Stage)</p>
              <p className="text-gray-600 text-sm">Plot B: Beans (Flowering Stage)</p>
            </>
          )}
        </div>

        {/* Quick Log Expense Form */}
        <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-blue-600">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Quick Log Expense</h3>
          {submitted && <div className="mb-2 text-xs text-green-600 font-semibold">Expense logged successfully!</div>}
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Select Plot</label>
              <select 
                value={expenseForm.plotId}
                onChange={e => setExpenseForm({...expenseForm, plotId: e.target.value})}
                className="w-full p-2 border rounded text-sm bg-white"
              >
                <option value="1">Plot A (Maize)</option>
                <option value="2">Plot B (Beans)</option>
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
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {expenses.map((exp, index) => (
                  <li key={index} className="text-xs bg-gray-50 p-2 rounded border flex justify-between items-center">
                    <span>{exp.category} (Plot {exp.plotId})</span>
                    <span className="font-bold text-green-700">UGX {Number(exp.amount).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;