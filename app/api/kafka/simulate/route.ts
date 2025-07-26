import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Simulate Kafka event generation
    const productIds = ["PRD001", "PRD002", "PRD003"]
    const eventTypes = ["purchase", "sale"]

    const randomProductId = productIds[Math.floor(Math.random() * productIds.length)]
    const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const randomQuantity = Math.floor(Math.random() * 50) + 10
    const randomPrice = Math.floor(Math.random() * 100) + 50

    const kafkaEvent = {
      product_id: randomProductId,
      event_type: randomEventType,
      quantity: randomQuantity,
      unit_price: randomEventType === "purchase" ? randomPrice : undefined,
      timestamp: new Date().toISOString(),
    }

    // In a real implementation, this would publish to Kafka
    // For demo purposes, we'll just return the event
    return NextResponse.json({
      success: true,
      event: kafkaEvent,
      message: `Simulated ${randomEventType} event for ${randomProductId}`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error simulating Kafka event" }, { status: 500 })
  }
}
