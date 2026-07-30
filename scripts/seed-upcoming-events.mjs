import { MongoClient } from "mongodb"

const URI = "mongodb://Robotics:WD0Yd9VuwNNa5Kdi@cluster0-shard-00-00.7xswv9.mongodb.net:27017,cluster0-shard-00-01.7xswv9.mongodb.net:27017,cluster0-shard-00-02.7xswv9.mongodb.net:27017/?ssl=true&replicaSet=atlas-e7cnjs-shard-0&authSource=admin&appName=Cluster0"
const DB_NAME = "robotics-club"

async function seed() {
  const client = new MongoClient(URI)
  try {
    await client.connect()
    console.log("Connected to MongoDB")
    const db = client.db(DB_NAME)

    // Mark all existing events as past
    const updateResult = await db.collection("events").updateMany(
      {},
      { $set: { isActive: false, status: "past" } }
    )
    console.log(`Marked ${updateResult.modifiedCount} existing events as past`)

    // Add upcoming events
    const upcomingEvents = [
      {
        name: "BotRush 4.0",
        year: 2026,
        theme: "To Be Announced",
        tagline: "The next chapter of innovation begins",
        description: "BotRush 4.0 — the flagship annual robotics event exclusively for first-year students at MNNIT Allahabad. Get ready for an even bigger, bolder edition with new challenges, workshops, and a massive Tech Expo. Dates to be announced soon.",
        date: "TBA",
        location: "MNNIT Allahabad",
        participantsLabel: "Open for all first-years",
        highlights: ["New competition formats", "Expanded Tech Expo", "Hands-on workshops", "Networking with seniors and alumni"],
        isActive: true,
        status: "upcoming",
        competitions: [],
        createdAt: new Date(),
      },
      {
        name: "Robomania - Avishkar 2026",
        year: 2026,
        theme: "To Be Announced",
        tagline: "Where gears grind, circuits spark, and innovation takes center stage",
        description: "Robomania returns as part of Avishkar 2026 — MNNIT's premier tech fest. Expect robotics competitions, coding challenges, autonomous navigation events, and more. Open to participants from all colleges and disciplines. Dates to be announced.",
        date: "TBA",
        location: "MNNIT Allahabad",
        participantsLabel: "2000+ Expected",
        highlights: ["Part of Avishkar 2026", "Open to all colleges", "Multiple robotics and coding events", "Prizes and certificates"],
        isActive: true,
        status: "upcoming",
        competitions: [],
        createdAt: new Date(),
      },
    ]

    for (const event of upcomingEvents) {
      const existing = await db.collection("events").findOne({ name: event.name, year: event.year })
      if (existing) {
        console.log(`[SKIP] "${event.name}" already exists`)
        continue
      }
      const result = await db.collection("events").insertOne(event)
      console.log(`[OK] "${event.name}" → ${result.insertedId}`)
    }

    const total = await db.collection("events").countDocuments()
    console.log(`\nTotal events: ${total}`)
  } catch (err) {
    console.error("Failed:", err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seed()
