"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Package, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react"

interface Product {
  product_id: string
  current_quantity: number
  total_cost: number
  average_cost: number
}

interface Transaction {
  id: string
  product_id: string
  event_type: "purchase" | "sale"
  quantity: number
  unit_price?: number
  total_cost?: number
  timestamp: string
}

interface InventoryBatch {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  remaining_quantity: number
  created_at: string
}

export default function InventoryDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [batches, setBatches] = useState<InventoryBatch[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [simulatorRunning, setSimulatorRunning] = useState(false)

  // Mock authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "admin" && password === "inventory123") {
      setIsAuthenticated(true)
    } else {
      alert("Invalid credentials. Use admin/inventory123")
    }
  }

  // Initialize mock data
  useEffect(() => {
    if (isAuthenticated) {
      initializeMockData()
      setIsConnected(true)
    }
  }, [isAuthenticated])

  const initializeMockData = () => {
    const mockProducts: Product[] = [
      { product_id: "PRD001", current_quantity: 150, total_cost: 12500, average_cost: 83.33 },
      { product_id: "PRD002", current_quantity: 75, total_cost: 9000, average_cost: 120.0 },
      { product_id: "PRD003", current_quantity: 200, total_cost: 8000, average_cost: 40.0 },
    ]

    const mockTransactions: Transaction[] = [
      {
        id: "1",
        product_id: "PRD001",
        event_type: "purchase",
        quantity: 100,
        unit_price: 80,
        total_cost: 8000,
        timestamp: "2025-01-26T10:00:00Z",
      },
      {
        id: "2",
        product_id: "PRD001",
        event_type: "purchase",
        quantity: 100,
        unit_price: 90,
        total_cost: 9000,
        timestamp: "2025-01-26T11:00:00Z",
      },
      {
        id: "3",
        product_id: "PRD001",
        event_type: "sale",
        quantity: 50,
        total_cost: 4000,
        timestamp: "2025-01-26T12:00:00Z",
      },
      {
        id: "4",
        product_id: "PRD002",
        event_type: "purchase",
        quantity: 100,
        unit_price: 120,
        total_cost: 12000,
        timestamp: "2025-01-26T13:00:00Z",
      },
      {
        id: "5",
        product_id: "PRD002",
        event_type: "sale",
        quantity: 25,
        total_cost: 3000,
        timestamp: "2025-01-26T14:00:00Z",
      },
    ]

    const mockBatches: InventoryBatch[] = [
      {
        id: "B1",
        product_id: "PRD001",
        quantity: 100,
        unit_price: 80,
        remaining_quantity: 50,
        created_at: "2025-01-26T10:00:00Z",
      },
      {
        id: "B2",
        product_id: "PRD001",
        quantity: 100,
        unit_price: 90,
        remaining_quantity: 100,
        created_at: "2025-01-26T11:00:00Z",
      },
      {
        id: "B3",
        product_id: "PRD002",
        quantity: 100,
        unit_price: 120,
        remaining_quantity: 75,
        created_at: "2025-01-26T13:00:00Z",
      },
    ]

    setProducts(mockProducts)
    setTransactions(mockTransactions)
    setBatches(mockBatches)
  }

  // FIFO Cost Calculation Logic
  const calculateFIFOCost = (productId: string, saleQuantity: number): number => {
    const productBatches = batches
      .filter((b) => b.product_id === productId && b.remaining_quantity > 0)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    let remainingToSell = saleQuantity
    let totalCost = 0

    for (const batch of productBatches) {
      if (remainingToSell <= 0) break

      const quantityFromBatch = Math.min(remainingToSell, batch.remaining_quantity)
      totalCost += quantityFromBatch * batch.unit_price
      remainingToSell -= quantityFromBatch
    }

    return totalCost
  }

  // Kafka Event Simulator
  const simulateKafkaEvent = () => {
    const productIds = ["PRD001", "PRD002", "PRD003"]
    const eventTypes = ["purchase", "sale"]
    const randomProductId = productIds[Math.floor(Math.random() * productIds.length)]
    const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as "purchase" | "sale"
    const randomQuantity = Math.floor(Math.random() * 50) + 10
    const randomPrice = Math.floor(Math.random() * 100) + 50

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      product_id: randomProductId,
      event_type: randomEventType,
      quantity: randomQuantity,
      unit_price: randomEventType === "purchase" ? randomPrice : undefined,
      total_cost:
        randomEventType === "purchase"
          ? randomQuantity * randomPrice
          : calculateFIFOCost(randomProductId, randomQuantity),
      timestamp: new Date().toISOString(),
    }

    // Update transactions
    setTransactions((prev) => [newTransaction, ...prev])

    // Update products and batches based on FIFO logic
    if (randomEventType === "purchase") {
      // Add new batch
      const newBatch: InventoryBatch = {
        id: `B${Date.now()}`,
        product_id: randomProductId,
        quantity: randomQuantity,
        unit_price: randomPrice,
        remaining_quantity: randomQuantity,
        created_at: new Date().toISOString(),
      }
      setBatches((prev) => [...prev, newBatch])

      // Update product quantity and cost
      setProducts((prev) =>
        prev.map((p) => {
          if (p.product_id === randomProductId) {
            const newQuantity = p.current_quantity + randomQuantity
            const newTotalCost = p.total_cost + randomQuantity * randomPrice
            return {
              ...p,
              current_quantity: newQuantity,
              total_cost: newTotalCost,
              average_cost: newTotalCost / newQuantity,
            }
          }
          return p
        }),
      )
    } else {
      // Handle sale with FIFO
      const product = products.find((p) => p.product_id === randomProductId)
      if (product && product.current_quantity >= randomQuantity) {
        // Update batches (consume oldest first)
        let remainingToSell = randomQuantity
        setBatches((prev) =>
          prev.map((batch) => {
            if (batch.product_id === randomProductId && remainingToSell > 0 && batch.remaining_quantity > 0) {
              const consumed = Math.min(remainingToSell, batch.remaining_quantity)
              remainingToSell -= consumed
              return {
                ...batch,
                remaining_quantity: batch.remaining_quantity - consumed,
              }
            }
            return batch
          }),
        )

        // Update product
        setProducts((prev) =>
          prev.map((p) => {
            if (p.product_id === randomProductId) {
              const newQuantity = p.current_quantity - randomQuantity
              const costOfSale = calculateFIFOCost(randomProductId, randomQuantity)
              const newTotalCost = p.total_cost - costOfSale
              return {
                ...p,
                current_quantity: newQuantity,
                total_cost: newTotalCost,
                average_cost: newQuantity > 0 ? newTotalCost / newQuantity : 0,
              }
            }
            return p
          }),
        )
      }
    }
  }

  // Auto simulator
  const startSimulator = () => {
    setSimulatorRunning(true)
    const interval = setInterval(() => {
      simulateKafkaEvent()
    }, 2000)

    setTimeout(() => {
      clearInterval(interval)
      setSimulatorRunning(false)
    }, 20000) // Run for 20 seconds
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Inventory Management System</CardTitle>
            <CardDescription className="text-center">Please login to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="inventory123"
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <div className="mt-4 text-sm text-gray-600 text-center">
              <p>Demo Credentials:</p>
              <p>
                Username: <code>admin</code>
              </p>
              <p>
                Password: <code>inventory123</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management System</h1>
            <p className="text-gray-600">FIFO Costing with Real-time Kafka Integration</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm text-gray-600">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
            <Button onClick={() => setIsAuthenticated(false)} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${products.reduce((sum, p) => sum + p.total_cost, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batches.filter((b) => b.remaining_quantity > 0).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Kafka Simulator */}
        <Card>
          <CardHeader>
            <CardTitle>Kafka Event Simulator</CardTitle>
            <CardDescription>Simulate real-time inventory events (purchases and sales)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={simulateKafkaEvent} disabled={simulatorRunning}>
                Send Single Event
              </Button>
              <Button onClick={startSimulator} disabled={simulatorRunning}>
                {simulatorRunning ? "Running Auto Simulator..." : "Start Auto Simulator (20s)"}
              </Button>
            </div>
            {simulatorRunning && (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Auto simulator is running. New events will be generated every 2 seconds for 20 seconds.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Stock Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Ledger</TabsTrigger>
            <TabsTrigger value="batches">Inventory Batches</TabsTrigger>
            <TabsTrigger value="fifo">FIFO Logic</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Product Stock Overview</CardTitle>
                <CardDescription>Current inventory levels with FIFO-based costing</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Current Quantity</TableHead>
                      <TableHead>Total Inventory Cost</TableHead>
                      <TableHead>Average Cost per Unit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.product_id}>
                        <TableCell className="font-medium">{product.product_id}</TableCell>
                        <TableCell>{product.current_quantity}</TableCell>
                        <TableCell>${product.total_cost.toFixed(2)}</TableCell>
                        <TableCell>${product.average_cost.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.current_quantity > 50 ? "default" : "destructive"}>
                            {product.current_quantity > 50 ? "In Stock" : "Low Stock"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Ledger</CardTitle>
                <CardDescription>Complete history of purchases and sales with FIFO cost calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{new Date(transaction.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{transaction.product_id}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.event_type === "purchase" ? "default" : "secondary"}>
                            {transaction.event_type === "purchase" ? (
                              <>
                                <TrendingUp className="w-3 h-3 mr-1" /> Purchase
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-3 h-3 mr-1" /> Sale
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>
                          {transaction.unit_price ? `$${transaction.unit_price.toFixed(2)}` : "FIFO Calculated"}
                        </TableCell>
                        <TableCell>${transaction.total_cost?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batches">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Batches</CardTitle>
                <CardDescription>Current inventory batches ordered by purchase date (FIFO order)</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Original Quantity</TableHead>
                      <TableHead>Remaining Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">{batch.id}</TableCell>
                          <TableCell>{batch.product_id}</TableCell>
                          <TableCell>{batch.quantity}</TableCell>
                          <TableCell>{batch.remaining_quantity}</TableCell>
                          <TableCell>${batch.unit_price.toFixed(2)}</TableCell>
                          <TableCell>{new Date(batch.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={batch.remaining_quantity > 0 ? "default" : "secondary"}>
                              {batch.remaining_quantity > 0 ? "Active" : "Consumed"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fifo">
            <Card>
              <CardHeader>
                <CardTitle>FIFO Logic Explanation</CardTitle>
                <CardDescription>Understanding First-In-First-Out inventory costing method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold">How FIFO Works:</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>
                      <strong>Purchase Events:</strong> Create new inventory batches with quantity, unit price, and
                      timestamp
                    </li>
                    <li>
                      <strong>Sale Events:</strong> Consume inventory from the oldest batches first (First-In-First-Out)
                    </li>
                    <li>
                      <strong>Cost Calculation:</strong> Sale cost is calculated by consuming quantities from oldest
                      batches at their original purchase prices
                    </li>
                    <li>
                      <strong>Remaining Inventory:</strong> Always valued at the most recent purchase prices
                    </li>
                  </ol>

                  <Separator className="my-4" />

                  <h3 className="text-lg font-semibold">Example FIFO Calculation:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>
                      <strong>Purchases:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4">
                      <li>Jan 1: 100 units @ $80 each</li>
                      <li>Jan 2: 100 units @ $90 each</li>
                    </ul>
                    <p className="mt-2">
                      <strong>Sale:</strong> 150 units
                    </p>
                    <p className="mt-2">
                      <strong>FIFO Cost Calculation:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4">
                      <li>First 100 units from Jan 1 batch: 100 × $80 = $8,000</li>
                      <li>Next 50 units from Jan 2 batch: 50 × $90 = $4,500</li>
                      <li>
                        <strong>Total Sale Cost: $12,500</strong>
                      </li>
                    </ul>
                    <p className="mt-2">
                      <strong>Remaining Inventory:</strong> 50 units @ $90 = $4,500
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
