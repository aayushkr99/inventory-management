# Inventory Management System (FIFO) - Real-Time Dashboard

A comprehensive inventory management system built with FIFO (First-In-First-Out) costing methodology, featuring real-time data ingestion through Kafka and a live dashboard. 

## 🚀 Live Demo

- **Frontend**: [https://your-app.vercel.app](https://your-app.vercel.app)
- **Backend API**: [https://your-app.vercel.app/api](https://your-app.vercel.app/api)
- **Login Credentials**:
  - Username: `admin`
  - Password: `inventory123`

## 🏗️ Architecture Overview

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kafka Topic   │───▶│   Backend API   │───▶│   PostgreSQL    │
│ inventory-events│    │   (Node.js)     │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  React Frontend │
                       │   (Dashboard)   │
                       └─────────────────┘
\`\`\`

## 🎯 Key Features

### ✅ FIFO Costing Logic
- **Purchase Events**: Create inventory batches with timestamp-based ordering
- **Sale Events**: Consume inventory from oldest batches first
- **Cost Calculation**: Accurate FIFO-based cost of goods sold
- **Real-time Updates**: Live inventory valuation and quantity tracking

### ✅ Kafka Integration
- **Producer**: Simulates real-time purchase/sale events
- **Consumer**: Processes events and updates inventory
- **Event Schema**: Standardized JSON format for all transactions
- **Topic**: `inventory-events` for all inventory operations

### ✅ PostgreSQL Data Model
- **Products**: Master product information
- **Inventory Batches**: FIFO-ordered purchase batches
- **Sales**: Transaction records with FIFO cost calculation
- **Transactions**: Complete audit trail of all events

### ✅ Live Dashboard
- **Stock Overview**: Real-time inventory levels and costs
- **Transaction Ledger**: Complete transaction history
- **FIFO Visualization**: Batch consumption tracking
- **Event Simulator**: Generate test events in real-time

## 🛠️ Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with FIFO-optimized schema
- **Messaging**: Apache Kafka (simulated with REST API)
- **Frontend**: React with Next.js
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel (Full-stack deployment)

## 📊 FIFO Logic Explanation

### How FIFO Works:

1. **Purchase Events**: Create new inventory batches
   \`\`\`json
   {
     "product_id": "PRD001",
     "event_type": "purchase",
     "quantity": 100,
     "unit_price": 80.0,
     "timestamp": "2025-01-26T10:00:00Z"
   }
   \`\`\`

2. **Sale Events**: Consume from oldest batches first
   \`\`\`json
   {
     "product_id": "PRD001",
     "event_type": "sale",
     "quantity": 50,
     "timestamp": "2025-01-26T12:00:00Z"
   }
   \`\`\`

3. **Cost Calculation Example**:
   - **Purchases**: 
     - Jan 1: 100 units @ $80 each
     - Jan 2: 100 units @ $90 each
   - **Sale**: 150 units
   - **FIFO Cost**: 
     - First 100 units from Jan 1 batch: 100 × $80 = $8,000
     - Next 50 units from Jan 2 batch: 50 × $90 = $4,500
     - **Total Cost of Sale**: $12,500
   - **Remaining Inventory**: 50 units @ $90 = $4,500

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/inventory-management-fifo.git
   cd inventory-management-fifo
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up PostgreSQL database**
   \`\`\`bash
   # Create database and tables
   npm run db:create
   
   # Seed with sample data
   npm run db:seed
   \`\`\`

4. **Environment variables**
   \`\`\`bash
   # Create .env.local file
   DATABASE_URL=postgresql://username:password@localhost:5432/inventory_management
   NEXTAUTH_SECRET=your-secret-key
   KAFKA_BROKER_URL=localhost:9092
   \`\`\`

5. **Run the application**
   \`\`\`bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build && npm start
   \`\`\`

### Kafka Simulation

1. **Start Kafka Producer**
   \`\`\`bash
   npm run kafka:producer
   \`\`\`

2. **Start Kafka Consumer**
   \`\`\`bash
   npm run kafka:consumer
   \`\`\`

## 📡 API Endpoints

### Inventory Management
- `GET /api/inventory` - Get current inventory state
- `POST /api/inventory` - Process inventory event
- `GET /api/products` - List all products
- `GET /api/transactions` - Get transaction history

### Kafka Simulation
- `POST /api/kafka/simulate` - Generate random inventory event
- `GET /api/kafka/status` - Check Kafka connection status

### Example API Usage

\`\`\`bash
# Process a purchase event
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PRD001",
    "event_type": "purchase",
    "quantity": 100,
    "unit_price": 85.0,
    "timestamp": "2025-01-26T10:00:00Z"
  }'

# Process a sale event
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "PRD001",
    "event_type": "sale",
    "quantity": 50,
    "timestamp": "2025-01-26T12:00:00Z"
  }'
\`\`\`

## 🗄️ Database Schema

### Key Tables

1. **products** - Master product catalog
2. **inventory_batches** - FIFO-ordered purchase batches
3. **sales** - Sales transactions with FIFO costing
4. **transactions** - Complete audit trail
5. **sale_batch_details** - Tracks batch consumption per sale

### FIFO Functions

- `calculate_fifo_cost()` - Calculate sale cost using FIFO
- `process_sale_fifo()` - Process sale and update batches
- `update_product_totals()` - Maintain product aggregates

## 🎨 Frontend Features

### Dashboard Components
- **Stock Overview**: Real-time inventory levels and costs
- **Transaction Ledger**: Filterable transaction history
- **Batch Tracking**: Visual FIFO batch consumption
- **Event Simulator**: Generate test events
- **Authentication**: Basic login system

### Real-time Updates
- WebSocket connections for live data
- Auto-refresh every 5 seconds
- Event-driven UI updates
- Loading states and error handling

## 🚀 Deployment

### Vercel Deployment

1. **Deploy to Vercel**
   \`\`\`bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   \`\`\`

2. **Environment Variables**
   Set these in Vercel dashboard:
   \`\`\`
   DATABASE_URL=your-postgresql-connection-string
   NEXTAUTH_SECRET=your-secret-key
   \`\`\`

3. **Database Setup**
   - Use Neon, Supabase, or Railway for PostgreSQL
   - Run migration scripts in production

### Alternative Deployments
- **Railway**: Full-stack with PostgreSQL
- **Render**: Backend + frontend deployment
- **Fly.io**: Containerized deployment

## 🧪 Testing

### Unit Tests
\`\`\`bash
npm run test
\`\`\`

### Integration Tests
\`\`\`bash
npm run test:integration
\`\`\`

### Load Testing
\`\`\`bash
# Test Kafka event processing
npm run test:load
\`\`\`

## 📈 Performance Considerations

### Database Optimization
- Indexed queries on product_id and timestamps
- Batch processing for high-volume events
- Connection pooling for concurrent requests

### Kafka Optimization
- Partitioned topics for scalability
- Consumer groups for parallel processing
- Message batching for throughput

### Frontend Optimization
- React.memo for component optimization
- Debounced API calls
- Lazy loading for large datasets

## 🔧 Configuration

### Kafka Configuration
\`\`\`javascript
// kafka.config.js
module.exports = {
  clientId: 'inventory-management',
  brokers: ['localhost:9092'],
  topics: {
    inventoryEvents: 'inventory-events'
  }
}
\`\`\`

### Database Configuration
\`\`\`javascript
// db.config.js
module.exports = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  pool: {
    min: 2,
    max: 10
  }
}
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions and support:
- Create an issue on GitHub
- Email: support@yourcompany.com
- Documentation: [Wiki](https://github.com/yourusername/inventory-management-fifo/wiki)

---

**Built with ❤️ for efficient inventory management**
