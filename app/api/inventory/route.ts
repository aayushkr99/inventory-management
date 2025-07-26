import { type NextRequest, NextResponse } from "next/server"

// Mock database - In production, this would be PostgreSQL
const products = [
  { product_id: "PRD001", current_quantity: 150, total_cost: 12500, average_cost: 83.33 },
  { product_id: "PRD002", current_quantity: 75, total_cost: 9000, average_cost: 120.0 },
  { product_id: "PRD003", current_quantity: 200, total_cost: 8000, average_cost: 40.0 },
]

const transactions = [
  {
    id: "1",
    product_id: "PRD001",
    event_type: "purchase",
    quantity: 100,
    unit_price: 80,
    total_cost: 8000,
    timestamp: "2025-01-26T10:00:00Z",
  },
]

const batches = [
  {
    id: "B1",
    product_id: "PRD001",
    quantity: 100,
    unit_price: 80,
    remaining_quantity: 50,
    created_at: "2025-01-26T10:00:00Z",
  },
]

export async function GET() {
  return NextResponse.json({
    products,
    transactions,
    batches,
  })
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    // Process Kafka-like event
    const { product_id, event_type, quantity, unit_price, timestamp } = event

    if (event_type === "purchase") {
      // Create new batch
      const newBatch = {
        id: `B${Date.now()}`,
        product_id,
        quantity,
        unit_price,
        remaining_quantity: quantity,
        created_at: timestamp || new Date().toISOString(),
      }
      batches.push(newBatch)

      // Update product
      const productIndex = products.findIndex((p) => p.product_id === product_id)
      if (productIndex >= 0) {
        const product = products[productIndex]
        const newQuantity = product.current_quantity + quantity
        const newTotalCost = product.total_cost + quantity * unit_price
        products[productIndex] = {
          ...product,
          current_quantity: newQuantity,
          total_cost: newTotalCost,
          average_cost: newTotalCost / newQuantity,
        }
      } else {
        // Create new product
        products.push({
          product_id,
          current_quantity: quantity,
          total_cost: quantity * unit_price,
          average_cost: unit_price,
        })
      }

      // Add transaction
      transactions.unshift({
        id: Date.now().toString(),
        product_id,
        event_type,
        quantity,
        unit_price,
        total_cost: quantity * unit_price,
        timestamp: timestamp || new Date().toISOString(),
      })
    } else if (event_type === "sale") {
      // FIFO cost calculation
      const productBatches = batches
        .filter((b) => b.product_id === product_id && b.remaining_quantity > 0)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      let remainingToSell = quantity
      let totalCost = 0

      // Consume batches in FIFO order
      for (const batch of productBatches) {
        if (remainingToSell <= 0) break

        const quantityFromBatch = Math.min(remainingToSell, batch.remaining_quantity)
        totalCost += quantityFromBatch * batch.unit_price
        remainingToSell -= quantityFromBatch

        // Update batch
        const batchIndex = batches.findIndex((b) => b.id === batch.id)
        if (batchIndex >= 0) {
          batches[batchIndex].remaining_quantity -= quantityFromBatch
        }
      }

      // Update product
      const productIndex = products.findIndex((p) => p.product_id === product_id)
      if (productIndex >= 0) {
        const product = products[productIndex]
        const newQuantity = product.current_quantity - quantity
        const newTotalCost = product.total_cost - totalCost
        products[productIndex] = {
          ...product,
          current_quantity: newQuantity,
          total_cost: newTotalCost,
          average_cost: newQuantity > 0 ? newTotalCost / newQuantity : 0,
        }
      }

      // Add transaction
      transactions.unshift({
        id: Date.now().toString(),
        product_id,
        event_type,
        quantity,
        total_cost: totalCost,
        timestamp: timestamp || new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Event processed successfully",
      data: { products, transactions, batches },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error processing event" }, { status: 500 })
  }
}
