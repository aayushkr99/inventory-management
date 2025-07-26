'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ShoppingCart,
  BarChart3,
  FileText,
  Info,
  Play,
  Square,
  RotateCcw,
  RefreshCw
} from 'lucide-react';

interface Product {
  product_id: string;
  name: string;
  description: string;
  current_quantity: number;
  total_cost: number | string;
  average_cost: number | string;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  transaction_id: string;
  product_id: string;
  event_type: 'purchase' | 'sale';
  quantity: number;
  unit_price: number | string | null;
  total_cost: number | string;
  timestamp: string;
}

interface Batch {
  batch_id: string;
  product_id: string;
  quantity: number;
  unit_price: number | string;
  remaining_quantity: number;
  purchase_date: string;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [isSyncRunning, setIsSyncRunning] = useState(false);
  const [syncInterval, setSyncInterval] = useState<NodeJS.Timeout | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    setProducts([
      {
        product_id: "PRD001",
        name: "Laptop Dell XPS 13",
        description: "High-performance laptop with Intel i7 processor",
        current_quantity: 40,
        total_cost: 48000.00,
        average_cost: 1200.00,
        created_at: "2025-01-15T10:00:00Z",
        updated_at: "2025-01-20T14:30:00Z"
      },
      {
        product_id: "PRD002",
        name: "iPhone 15 Pro",
        description: "Latest iPhone with A17 Pro chip",
        current_quantity: 85,
        total_cost: 80750.00,
        average_cost: 950.00,
        created_at: "2025-01-10T09:00:00Z",
        updated_at: "2025-01-18T16:45:00Z"
      },
      {
        product_id: "PRD003",
        name: "Samsung 4K TV 55\"",
        description: "Smart TV with HDR support",
        current_quantity: 20,
        total_cost: 15000.00,
        average_cost: 750.00,
        created_at: "2025-01-05T11:00:00Z",
        updated_at: "2025-01-15T13:20:00Z"
      }
    ]);

    setTransactions([
      {
        transaction_id: "T001",
        product_id: "PRD001",
        event_type: "purchase",
        quantity: 50,
        unit_price: 1200.00,
        total_cost: 60000.00,
        timestamp: "2025-01-15T10:00:00Z"
      },
      {
        transaction_id: "T002",
        product_id: "PRD001",
        event_type: "sale",
        quantity: 10,
        unit_price: null,
        total_cost: 12999.90,
        timestamp: "2025-01-20T14:30:00Z"
      },
      {
        transaction_id: "T003",
        product_id: "PRD002",
        event_type: "purchase",
        quantity: 100,
        unit_price: 950.00,
        total_cost: 95000.00,
        timestamp: "2025-01-10T09:00:00Z"
      },
      {
        transaction_id: "T004",
        product_id: "PRD002",
        event_type: "sale",
        quantity: 15,
        unit_price: null,
        total_cost: 14999.85,
        timestamp: "2025-01-18T16:45:00Z"
      }
    ]);

    setBatches([
      {
        batch_id: "B001",
        product_id: "PRD001",
        quantity: 50,
        unit_price: 1200.00,
        remaining_quantity: 40,
        purchase_date: "2025-01-15T10:00:00Z"
      },
      {
        batch_id: "B002",
        product_id: "PRD002",
        quantity: 100,
        unit_price: 950.00,
        remaining_quantity: 85,
        purchase_date: "2025-01-10T09:00:00Z"
      },
      {
        batch_id: "B003",
        product_id: "PRD003",
        quantity: 25,
        unit_price: 750.00,
        remaining_quantity: 20,
        purchase_date: "2025-01-05T11:00:00Z"
      }
    ]);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (username === 'admin' && password === 'inventory123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
    
    setIsLoggingIn(false);
  };

  const generateRandomEvent = (eventType: 'purchase' | 'sale') => {
    const productIds = ['PRD001', 'PRD002', 'PRD003'];
    const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
    const quantity = Math.floor(Math.random() * 20) + 5; // 5-25 units
    const unitPrice = eventType === 'purchase' ? Math.floor(Math.random() * 500) + 800 : null; // 800-1300 for purchase
    const totalCost = eventType === 'purchase' ? quantity * (unitPrice || 0) : Math.floor(Math.random() * 10000) + 5000;

    return {
      transaction_id: `T${Date.now()}`,
      product_id: randomProductId,
      event_type: eventType,
      quantity: quantity,
      unit_price: unitPrice,
      total_cost: totalCost,
      timestamp: new Date().toISOString()
    };
  };

  const simulateKafkaEvent = async (eventType: 'purchase' | 'sale') => {
    setIsSimulatorRunning(true);
    
    // Generate 5 events with 2-second intervals
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction = generateRandomEvent(eventType);
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Update product quantities
      setProducts(prev => prev.map(product => {
        if (product.product_id === newTransaction.product_id) {
          const newQuantity = eventType === 'purchase' 
            ? product.current_quantity + newTransaction.quantity
            : product.current_quantity - newTransaction.quantity;
          const newTotalCost = eventType === 'purchase'
            ? (typeof product.total_cost === 'string' ? parseFloat(product.total_cost) : product.total_cost) + (newTransaction.total_cost as number)
            : (typeof product.total_cost === 'string' ? parseFloat(product.total_cost) : product.total_cost) - (newTransaction.total_cost as number);
          
          return {
            ...product,
            current_quantity: Math.max(0, newQuantity),
            total_cost: Math.max(0, newTotalCost),
            average_cost: newTotalCost / Math.max(1, newQuantity),
            updated_at: new Date().toISOString()
          };
        }
        return product;
      }));

      // Update batches for purchase events
      if (eventType === 'purchase') {
        const newBatch = {
          batch_id: `B${Date.now()}`,
          product_id: newTransaction.product_id,
          quantity: newTransaction.quantity,
          unit_price: newTransaction.unit_price || 0,
          remaining_quantity: newTransaction.quantity,
          purchase_date: new Date().toISOString()
        };
        setBatches(prev => [newBatch, ...prev]);
      } else {
        // Update existing batch for sale events
        setBatches(prev => prev.map(batch => {
          if (batch.product_id === newTransaction.product_id && batch.remaining_quantity > 0) {
            const soldFromThisBatch = Math.min(newTransaction.quantity, batch.remaining_quantity);
            return {
              ...batch,
              remaining_quantity: Math.max(0, batch.remaining_quantity - soldFromThisBatch)
            };
          }
          return batch;
        }));
      }
    }

    setIsSimulatorRunning(false);
  };

  const toggleSync = () => {
    if (isSyncRunning) {
      // Stop sync
      if (syncInterval) {
        clearInterval(syncInterval);
        setSyncInterval(null);
      }
      setIsSyncRunning(false);
    } else {
      // Start sync
      setIsSyncRunning(true);
      const interval = setInterval(() => {
        // Generate 5 purchase events
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const newTransaction = generateRandomEvent('purchase');
            setTransactions(prev => [newTransaction, ...prev]);
            
            setProducts(prev => prev.map(product => {
              if (product.product_id === newTransaction.product_id) {
                const newQuantity = product.current_quantity + newTransaction.quantity;
                const newTotalCost = (typeof product.total_cost === 'string' ? parseFloat(product.total_cost) : product.total_cost) + (newTransaction.total_cost as number);
                
                return {
                  ...product,
                  current_quantity: newQuantity,
                  total_cost: newTotalCost,
                  average_cost: newTotalCost / newQuantity,
                  updated_at: new Date().toISOString()
                };
              }
              return product;
            }));

            const newBatch = {
              batch_id: `B${Date.now()}`,
              product_id: newTransaction.product_id,
              quantity: newTransaction.quantity,
              unit_price: newTransaction.unit_price || 0,
              remaining_quantity: newTransaction.quantity,
              purchase_date: new Date().toISOString()
            };
            setBatches(prev => [newBatch, ...prev]);
          }, i * 1000); // 1 second apart
        }

        // Generate 5 sale events after 2.5 seconds
        setTimeout(() => {
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              const newTransaction = generateRandomEvent('sale');
              setTransactions(prev => [newTransaction, ...prev]);
              
              setProducts(prev => prev.map(product => {
                if (product.product_id === newTransaction.product_id) {
                  const newQuantity = Math.max(0, product.current_quantity - newTransaction.quantity);
                  const newTotalCost = Math.max(0, (typeof product.total_cost === 'string' ? parseFloat(product.total_cost) : product.total_cost) - (newTransaction.total_cost as number));
                  
                  return {
                    ...product,
                    current_quantity: newQuantity,
                    total_cost: newTotalCost,
                    average_cost: newQuantity > 0 ? newTotalCost / newQuantity : 0,
                    updated_at: new Date().toISOString()
                  };
                }
                return product;
              }));

              setBatches(prev => prev.map(batch => {
                if (batch.product_id === newTransaction.product_id && batch.remaining_quantity > 0) {
                  const soldFromThisBatch = Math.min(newTransaction.quantity, batch.remaining_quantity);
                  return {
                    ...batch,
                    remaining_quantity: Math.max(0, batch.remaining_quantity - soldFromThisBatch)
                  };
                }
                return batch;
              }));
            }, i * 1000); // 1 second apart
          }
        }, 2500);
      }, 5000); // 5-second interval
      
      setSyncInterval(interval);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Stock Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transaction Ledger', icon: FileText },
    { id: 'batches', label: 'Inventory Batches', icon: Package },
    { id: 'fifo', label: 'FIFO Logic', icon: Info }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Current Quantity</th>
                  <th>Total Cost</th>
                  <th>Average Cost</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id}>
                    <td className="font-semibold text-slate-700">{product.product_id}</td>
                    <td>{product.name}</td>
                    <td>{product.description}</td>
                    <td>
                      <span className="px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
                        {product.current_quantity}
                      </span>
                    </td>
                    <td>${typeof product.total_cost === 'string' ? parseFloat(product.total_cost).toFixed(2) : product.total_cost.toFixed(2)}</td>
                    <td>${typeof product.average_cost === 'string' ? parseFloat(product.average_cost).toFixed(2) : product.average_cost.toFixed(2)}</td>
                    <td>{new Date(product.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'transactions':
        return (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Product ID</th>
                  <th>Event Type</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Cost</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.transaction_id}>
                    <td className="font-semibold text-slate-700">{transaction.transaction_id}</td>
                    <td>{transaction.product_id}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        transaction.event_type === 'purchase' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {transaction.event_type}
                      </span>
                    </td>
                    <td>{transaction.quantity}</td>
                    <td>
                      {transaction.unit_price 
                        ? `$${typeof transaction.unit_price === 'string' ? parseFloat(transaction.unit_price).toFixed(2) : transaction.unit_price.toFixed(2)}`
                        : '-'
                      }
                    </td>
                    <td>${typeof transaction.total_cost === 'string' ? parseFloat(transaction.total_cost).toFixed(2) : transaction.total_cost.toFixed(2)}</td>
                    <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'batches':
        return (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Product ID</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Remaining Quantity</th>
                  <th>Purchase Date</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.batch_id}>
                    <td className="font-semibold text-slate-700">{batch.batch_id}</td>
                    <td>{batch.product_id}</td>
                    <td>{batch.quantity}</td>
                    <td>${typeof batch.unit_price === 'string' ? parseFloat(batch.unit_price).toFixed(2) : batch.unit_price.toFixed(2)}</td>
                    <td>
                      <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
                        {batch.remaining_quantity}
                      </span>
                    </td>
                    <td>{new Date(batch.purchase_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'fifo':
        return (
          <div className="fifo-explanation">
            <h3 className="fifo-title">FIFO (First In, First Out) Costing Method</h3>
            <div className="fifo-content">
              <p>
                FIFO is an inventory valuation method that assumes the first items purchased are the first ones sold. 
                This method is particularly useful for businesses that sell perishable goods or items with expiration dates.
              </p>
              
              <ul className="fifo-list">
                <li>When a purchase is made, a new inventory batch is created with the purchase price and quantity</li>
                <li>When a sale occurs, the oldest batches are consumed first</li>
                <li>The cost of goods sold is calculated based on the oldest inventory prices</li>
                <li>This method provides more accurate profit margins and inventory valuation</li>
              </ul>

              <div className="fifo-example">
                <h4 className="fifo-example-title">Example Scenario:</h4>
                <ul className="fifo-example-list">
                  <li>Purchase 50 laptops at $1,200 each (Batch 1)</li>
                  <li>Purchase 30 laptops at $1,300 each (Batch 2)</li>
                  <li>Sale of 20 laptops - Cost calculated from Batch 1: $1,200 × 20 = $24,000</li>
                  <li>Sale of 40 laptops - Cost calculated from Batch 1 (remaining 30) + Batch 2 (10): $1,200 × 30 + $1,300 × 10 = $49,000</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <form className="form" onSubmit={handleLogin}>
          <h2 className="form-title">Inventory Management</h2>
          <p className="form-subtitle">Login to access your dashboard</p>
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {loginError && (
            <div className="form-error">
              {loginError}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={isLoggingIn}>
            {isLoggingIn ? (
              <>
                <div className="loading-spinner"></div>
                Logging In...
              </>
            ) : (
              'Login'
            )}
          </button>
          
          <div className="demo-credentials">
            <p><strong>Demo Credentials:</strong> admin / inventory123</p>
          </div>
        </form>
      </div>
    );
  }

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => {
    const cost = typeof product.total_cost === 'string' ? parseFloat(product.total_cost) : product.total_cost;
    return sum + cost;
  }, 0);
  const totalQuantity = products.reduce((sum, product) => sum + product.current_quantity, 0);
  const averageCost = totalValue / totalQuantity || 0;

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <h1 className="title">Inventory Management System</h1>
              <p className="subtitle">Real-time FIFO costing with Kafka integration</p>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setIsAuthenticated(false)}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="status-row">
          <div className="status-indicator connected"></div>
          <span className="status-text">System Connected</span>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-title">Total Products</div>
            <div className="card-value">{totalProducts}</div>
            <div className="card-desc">Active inventory items</div>
          </div>
          
          <div className="card">
            <div className="card-title">Total Value</div>
            <div className="card-value">${totalValue.toFixed(2)}</div>
            <div className="card-desc">Current inventory worth</div>
          </div>
          
          <div className="card">
            <div className="card-title">Total Quantity</div>
            <div className="card-value">{totalQuantity}</div>
            <div className="card-desc">Units in stock</div>
          </div>
          
          <div className="card">
            <div className="card-title">Average Cost</div>
            <div className="card-value">${averageCost.toFixed(2)}</div>
            <div className="card-desc">Per unit average</div>
          </div>
        </div>

        <div className="simulator">
          <h3 className="simulator-title">Kafka Event Simulator</h3>
          <p className="simulator-desc">
            Simulate real-time inventory events to test the FIFO system
          </p>
          
          <div className="simulator-btns">
            <button 
              className="btn btn-primary"
              onClick={() => simulateKafkaEvent('purchase')}
              disabled={isSimulatorRunning || isSyncRunning}
            >
              {isSimulatorRunning ? (
                <>
                  <div className="loading-spinner"></div>
                  Generating 5 Purchases...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Simulate Purchase (5 events)
                </>
              )}
            </button>
            
            <button 
              className="btn btn-accent"
              onClick={() => simulateKafkaEvent('sale')}
              disabled={isSimulatorRunning || isSyncRunning}
            >
              {isSimulatorRunning ? (
                <>
                  <div className="loading-spinner"></div>
                  Generating 5 Sales...
                </>
              ) : (
                <>
                  <TrendingUp size={18} />
                  Simulate Sale (5 events)
                </>
              )}
            </button>

            <button 
              className={`btn ${isSyncRunning ? 'btn-secondary' : 'btn-accent'}`}
              onClick={toggleSync}
              disabled={isSimulatorRunning}
            >
              {isSyncRunning ? (
                <>
                  <div className="loading-spinner"></div>
                  Stop Sync
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Start Sync
                </>
              )}
            </button>
          </div>
        </div>

        <div className="tabs">
          <div className="tabs-list">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`tabs-trigger ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          <div className="tab-panel">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}