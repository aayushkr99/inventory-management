const events = [
  {
    product_id: "PRD001",
    event_type: "purchase",
    quantity: 100,
    unit_price: 95.0,
    timestamp: new Date().toISOString(),
  },
  {
    product_id: "PRD001",
    event_type: "sale",
    quantity: 30,
    timestamp: new Date().toISOString(),
  },
  {
    product_id: "PRD002",
    event_type: "purchase",
    quantity: 50,
    unit_price: 130.0,
    timestamp: new Date().toISOString(),
  },
  {
    product_id: "PRD002",
    event_type: "sale",
    quantity: 20,
    timestamp: new Date().toISOString(),
  },
  {
    product_id: "PRD003",
    event_type: "purchase",
    quantity: 75,
    unit_price: 45.0,
    timestamp: new Date().toISOString(),
  },
]

// Simulate sending events to Kafka topic 'inventory-events'
async function simulateKafkaProducer() {
  console.log("🚀 Starting Kafka Producer Simulation...")
  console.log("📡 Topic: inventory-events")
  console.log("")

  for (let i = 0; i < events.length; i++) {
    const event = events[i]

    console.log(`📤 Sending Event ${i + 1}:`)
    console.log(JSON.stringify(event, null, 2))

    // In real implementation, this would be:
    // await producer.send({
    //   topic: 'inventory-events',
    //   messages: [{ value: JSON.stringify(event) }]
    // });

    // Simulate API call to backend
    try {
      const response = await fetch("http://localhost:3000/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })

      if (response.ok) {
        console.log("✅ Event processed successfully")
      } else {
        console.log("❌ Error processing event")
      }
    } catch (error) {
      console.log("🔄 Simulating event processing (API not available)")
    }

    console.log("")

    // Wait 2 seconds between events
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  console.log("🎉 Kafka Producer Simulation Complete!")
}

// Run the simulation
simulateKafkaProducer().catch(console.error)

// Export for use in other modules
module.exports = { simulateKafkaProducer, events }
