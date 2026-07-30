import { MongoClient, ObjectId } from "mongodb"

const URI = "mongodb://Robotics:WD0Yd9VuwNNa5Kdi@cluster0-shard-00-00.7xswv9.mongodb.net:27017,cluster0-shard-00-01.7xswv9.mongodb.net:27017,cluster0-shard-00-02.7xswv9.mongodb.net:27017/?ssl=true&replicaSet=atlas-e7cnjs-shard-0&authSource=admin&appName=Cluster0"
const DB_NAME = "robotics-club"

// ═══════════════════════════════════════════════════════
// EVENTS + COMPETITIONS (from Pragati 2024 & 2025 PDFs)
// ═══════════════════════════════════════════════════════

const eventsData = [
  // ── BotRush 2024 (Academic Year 2023-24) ──
  {
    event: {
      name: "BotRush 2.0",
      year: 2024,
      theme: "Hands-On Innovation",
      tagline: "Flagship annual robotics event for first-year students",
      description: "BotRush is the flagship annual robotics event tailored specifically for first-year students at MNNIT Allahabad. It serves as a crucial stepping stone for newcomers, offering a unique opportunity to dive into the world of robotics in a supportive and engaging environment. With introductory challenges and beginner-friendly competitions, BotRush provides a platform for budding technocrats to explore their interests, refine their skills, and forge lasting connections within the robotics community.",
      date: "2024",
      location: "MNNIT Allahabad",
      participantsLabel: "500+ Participants",
      highlights: ["Beginner-friendly competitions", "Tech Expo with Director & SAC President", "Workshops on programming, electronics, mechanics, and AI", "Innovation Alley showcasing student projects"],
      isActive: false,
    },
    competitions: [
      {
        title: "Force Secure",
        type: "IoT",
        description: "Build an advanced access system with unique password entry, presence detection, holographic interface for secure access, real-time monitoring, and alert system for unauthorized attempts.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Must include password-based entry", "Presence detection required", "Alert system for unauthorized access"],
        registrationOpen: false,
      },
      {
        title: "Cell Phone Controlled Robot",
        type: "Manual",
        description: "Develop cell phone-controlled robots to navigate through a challenging arena filled with obstacles. Robots must maneuver through hazardous pathways, evade simulated threats, and adjust to dynamic terrains.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Robot must be controlled via cell phone", "Navigate obstacle-filled arena", "Demonstrate agility and resilience"],
        registrationOpen: false,
      },
      {
        title: "Line Follower Robot",
        type: "Autonomous",
        description: "Create and program robots with advanced sensors to navigate through dark paths while avoiding dangers. Robots encounter holographic illusions presenting various challenges, testing problem-solving skills and ability to maneuver accurately.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Robot must follow line autonomously", "Must navigate dark paths", "Sensor-based detection required"],
        registrationOpen: false,
      },
      {
        title: "Force Innovate",
        type: "Combat",
        description: "Develop droids capable of outsmarting cunning adversaries. Incorporate advanced technology, intuitive sensors, and intelligent AI. Merge cutting-edge tech with innovative concepts to push the boundaries of innovation.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Advanced sensors required", "AI-based decision making", "Must outsmart adversaries"],
        registrationOpen: false,
      },
      {
        title: "Botwars",
        type: "Combat",
        description: "Design bots that outwit the most ingenious adversaries. Think advanced features, intuitive sensors, and intelligent algorithms. Blend state-of-the-art technology with innovative concepts.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Combat-ready bot design", "Must withstand opponent attacks", "Remote controlled"],
        registrationOpen: false,
      },
      {
        title: "Tech-Expo",
        type: "Exhibition",
        description: "The Botruh 2.0 expo showcased the pinnacle of student innovation in robotics. Graced by the Director and SAC President, Innovation Alley featured stalls displaying robots including both software and hardware models.",
        minTeamSize: 1, maxTeamSize: 6,
        rules: ["Project demonstration required", "Both hardware and software projects welcome"],
        registrationOpen: false,
      },
    ],
  },

  // ── Robomania - Avishkar 2024 (Academic Year 2023-24) ──
  {
    event: {
      name: "Robomania - Avishkar 2024",
      year: 2024,
      theme: "The Robotic Pulse of Avishkar",
      tagline: "Robotics segment of MNNIT's premier tech fest Avishkar",
      description: "Robomania is a prominent event that takes place during Avishkar, the annual tech fest of MNNIT Allahabad. This event is one of the highlights of the fest, attracting participants and enthusiasts from various technical and engineering backgrounds. It includes a series of competitions and challenges designed to test skills in designing, building, and programming robots. Over 2000+ participants across all events.",
      date: "2024",
      location: "MNNIT Allahabad",
      participantsLabel: "2000+ Participants",
      highlights: ["Part of Avishkar - MNNIT's premier tech fest", "Multiple robotics competitions", "Participants from various technical backgrounds", "2000+ total participants"],
      isActive: false,
    },
    competitions: [
      {
        title: "Cozmo-Clench",
        type: "Manual",
        description: "Construct a wirelessly controlled robot that can grip various objects and place them in designated target zones. The robot must have a reliable gripping mechanism for handling objects of different shapes and sizes with precise wireless control.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Wireless control required", "Must grip and place objects", "Accurate placement in target zones"],
        registrationOpen: false,
      },
      {
        title: "Hack Quest",
        type: "Software",
        description: "An idea presentation event where participants propose innovative robotics projects and solve problems using machine learning. Emphasizes innovative thinking, problem-solving, and effective communication.",
        minTeamSize: 1, maxTeamSize: 4,
        rules: ["Idea presentation format", "Must use machine learning", "Clear and convincing presentation required"],
        registrationOpen: false,
      },
      {
        title: "Track-n-Trek",
        type: "Autonomous",
        description: "Build a line-following robot that navigates a track using the shortest path algorithm. The robot needs sensors to detect and follow a line consistently and must calculate and follow the shortest path to complete the track quickly.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Autonomous line following", "Shortest path algorithm", "Sensor-based navigation"],
        registrationOpen: false,
      },
      {
        title: "Navigate the Dark",
        type: "Autonomous",
        description: "Construct a wirelessly controlled robot that solves a hidden maze using a live camera feed. The robot must have cameras for real-time video feedback and an algorithm to interpret the feed for navigation in low-visibility conditions.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Camera-based navigation", "Must solve hidden maze", "Real-time image processing"],
        registrationOpen: false,
      },
      {
        title: "Detect N Direct",
        type: "Autonomous",
        description: "Build an autonomous device that detects target circles and accurately points a laser at their centers. Uses image recognition to locate targets and a precise mechanism to aim the laser.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Autonomous target detection", "Laser pointing accuracy", "Image recognition required"],
        registrationOpen: false,
      },
    ],
  },

  // ── BotRush 3.0 (Academic Year 2024-25) ──
  {
    event: {
      name: "BotRush 3.0",
      year: 2025,
      theme: "The Quantum Leap",
      tagline: "Flagship annual robotics event exclusively for first-year students",
      description: "BotRush 3.0 is the flagship annual robotics event exclusively designed for first-year students at MNNIT Allahabad. It serves as a vital launchpad for newcomers, offering a hands-on gateway into the world of robotics within a supportive and inspiring environment. More than just a competition, the event sparks creativity, fuels innovation, and lays a strong foundation for future success in robotics.",
      date: "2025",
      location: "MNNIT Allahabad",
      participantsLabel: "600+ Participants",
      highlights: ["BotRush 3.0 Tech Expo with Director & SAC President", "Heist-themed autonomous challenges", "Robo War combat arena", "AI and computer vision competitions", "Workshops on programming, electronics, mechanics, and AI"],
      isActive: false,
    },
    competitions: [
      {
        title: "Heist Track",
        type: "Autonomous",
        description: "Build a fully autonomous robot capable of navigating a dynamic arena guarded by deceptive paths, unpredictable traps, and relentless security. No remote control, no manual intervention — pure engineering, innovation, and coding excellence.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Fully autonomous — no remote control", "Must navigate dynamic arena", "No hardcoding allowed"],
        registrationOpen: false,
      },
      {
        title: "Heist-O-Matic",
        type: "IoT",
        description: "Design a smart home system equipped with sensors, automation, and secure control features to outwit a sophisticated security grid. From intelligent door locks and intrusion alerts to smart lighting and cloud-based data systems.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["IoT-based smart home system", "Sensors and automation required", "Cloud integration expected"],
        registrationOpen: false,
      },
      {
        title: "Robo War",
        type: "Combat",
        description: "The ultimate battlefield where bots clash in an all-out war to crush, flip, ram, or throw opponents out of the arena. Remote-controlled destruction and high-octane chaos packed into a steel cage. No mercy. No retreat. Only one rule — dominate or be dismantled.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Remote controlled combat bot", "Must survive in steel cage arena", "Dominate or be dismantled"],
        registrationOpen: false,
      },
      {
        title: "Infiltrator",
        type: "Autonomous",
        description: "Build a fully autonomous ESP32-CAM-based robot to navigate a maze using ArUco marker detection and real-time command execution. Interpret directional cues embedded in ArUco IDs. No remote control, no hardcoding.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["ESP32-CAM required", "ArUco marker detection", "Fully autonomous — no remote control"],
        registrationOpen: false,
      },
      {
        title: "Hacktivate",
        type: "Software",
        description: "A triad of high-stakes challenges where AI meets real-world impact. Participants solve missions blending machine learning, sentiment analysis, and reinforcement intelligence. From mapping crime-prone zones to deploying RL-driven bots in combat arenas.",
        minTeamSize: 1, maxTeamSize: 4,
        rules: ["Machine learning required", "Real-world problem solving", "No shortcuts or hardcoding"],
        registrationOpen: false,
      },
      {
        title: "Silent Breach",
        type: "Autonomous",
        description: "Design and control camera-guided robots capable of navigating an unseen maze using live video feedback and calculated decisions. A test of strategy, precision, and awareness in the absence of light.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Camera-guided navigation", "Must solve maze in darkness", "Live video feedback required"],
        registrationOpen: false,
      },
      {
        title: "Tech-Expo 3.0",
        type: "Exhibition",
        description: "BotRush 3.0 Tech Expo — a dynamic platform celebrating creativity and technical skills of first-year students. Featured the Director and SAC President engaging with students, Innovation Alley with student-built robots and tech models.",
        minTeamSize: 1, maxTeamSize: 6,
        rules: ["Project demonstration required", "Both hardware and software welcome", "Innovation and creativity valued"],
        registrationOpen: false,
      },
    ],
  },

  // ── Robomania - Avishkar 2025 (Academic Year 2024-25) ──
  {
    event: {
      name: "Robomania - Avishkar 2025",
      year: 2025,
      theme: "The Robotic Pulse of Avishkar",
      tagline: "Where gears grind, circuits spark, and innovation takes center stage",
      description: "Robomania stands as one of the most thrilling and crowd-pulling highlights of Avishkar, the annual tech fest of MNNIT Allahabad. Dedicated entirely to the world of robotics, it's a battleground for bots and brains. From fierce competitions to mind-bending challenges, it brings together young engineers and tech enthusiasts from across disciplines. Whether it's automation, agility, or algorithmic precision — Robomania tests it all.",
      date: "2025",
      location: "MNNIT Allahabad",
      participantsLabel: "2000+ Participants",
      highlights: ["Part of Avishkar - MNNIT's flagship tech festival", "Code Sprint competitive programming", "Path Blaze line follower challenge", "Euphoria-Drift racing challenge", "Doodle Bot artistic automation"],
      isActive: false,
    },
    competitions: [
      {
        title: "Code Sprint",
        type: "Software",
        description: "A beginner-friendly coding competition designed for first-year students. Introduces core programming concepts through logic-based MCQs, code debugging tasks, and short coding problems. Builds a solid foundation for hackathons, coding interviews, and online judges.",
        minTeamSize: 1, maxTeamSize: 2,
        rules: ["Logic-based MCQs", "Code debugging tasks", "Short coding problems", "Speed and accuracy matter"],
        registrationOpen: false,
      },
      {
        title: "Path Blaze",
        type: "Autonomous",
        description: "A line follower robot challenge where participants design and build a robot capable of detecting and following a path marked on the ground. Teams program their bot to efficiently trace a complex track without human intervention.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Line following — no human intervention", "Must trace complex track", "Speed, accuracy, and innovation valued"],
        registrationOpen: false,
      },
      {
        title: "Euphoria-Drift",
        type: "Manual",
        description: "A high-speed, high-precision robotics challenge designed for first-year students. Build a manually or autonomously controlled robot that can navigate a drifting path or circuit-style arena with agility and accuracy, executing perfect drifts.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Navigate circuit-style arena", "Drifting challenges", "Speed and control balance"],
        registrationOpen: false,
      },
      {
        title: "Doodle Bot",
        type: "Autonomous",
        description: "Build an autonomous bot that can decode a pattern from an image using Python and OpenCV with ArUco markers, then physically draw it on a white arena using a mounted marker. Combines image processing, automation, and artistic design.",
        minTeamSize: 2, maxTeamSize: 4,
        rules: ["Python + OpenCV for image processing", "ArUco marker detection", "Bot must draw pattern autonomously"],
        registrationOpen: false,
      },
    ],
  },

  // ── Global Alumni Convention ──
  {
    event: {
      name: "Global Alumni Convention (GAC)",
      year: 2025,
      theme: "Celebrate Connections",
      tagline: "Where journeys converge and legacies grow",
      description: "The Robotics Club's participation in the Global Alumni Meet, organized by the MNNIT Alumni Association (MAA), serves as a dynamic bridge between alumni engagement and technological innovation. Through interactive displays of cutting-edge creations — humanoid robots, robotic arms, and self-balancing bots — the club captures the imagination of attendees. Tech talks, live demos, and hands-on sessions help bridge the gap between academia and industry.",
      date: "2025",
      location: "MNNIT Allahabad",
      participantsLabel: "Alumni & Students",
      highlights: ["Interactive project displays", "Humanoid robots and robotic arms showcase", "Alumni mentorship connections", "Tech talks and live demos", "Bridge between academia and industry"],
      isActive: false,
    },
    competitions: [],
  },
]

// ═══════════════════════════════════════════════════════
// ACHIEVEMENTS (site_content collection)
// ═══════════════════════════════════════════════════════

const achievementsContent = {
  sectionId: "achievements",
  content: {
    heading: "Achievements",
    items: [
      {
        title: "E-Yantra Robotics Competition — 2nd Prize",
        source: "IIT Bombay",
        description: "Won second prize in the E-Yantra Robotics Competition under the theme Astro Tinker Bot — an FPGA-based Robotic System for Autonomous Path Planning and Navigation. The project developed a custom RISC-V CPU on FPGA with path planning algorithms and sensor integration for autonomous navigation.",
        rank: "2nd",
        year: 2024,
        team: ["Sudhanshu Ranjan (20215049)", "Sumit Saroj (20215155)", "Md Faizan (20212027)"],
      },
      {
        title: "TechFest AtomQuest — 2nd Prize",
        source: "IIT Bombay TechFest",
        description: "Secured second prize in the AtomQuest event at TechFest IIT Bombay. Team Technotron built VoiceVault — a voice-controlled smart drawer system that opens and closes drawers using voice commands. Also emerged as finalists in Meshmerize, Cozmoclench, Tech Aid, and Hack-AI events.",
        rank: "2nd",
        year: 2024,
        team: ["Sarthak Kumar (Leader, 3rd Year)", "Bipul Karna (4th Year)", "Avneesh Sahu (2nd Year)", "Piyush Chourasia (2nd Year)"],
      },
      {
        title: "TechFest IIT Bombay — Multiple Finalist Appearances",
        source: "IIT Bombay TechFest",
        description: "Emerged as finalists in multiple events at TechFest IIT Bombay including Meshmerize, Cozmoclench, Tech Aid, Hack-AI, and secured commendable positions, establishing MNNIT as formidable contenders in robotics.",
        rank: "Finalist",
        year: 2024,
      },
    ],
  },
  updatedAt: new Date(),
}

// ═══════════════════════════════════════════════════════
// BEHIND THE CLUB — Faculty & Leadership (site_content)
// ═══════════════════════════════════════════════════════

const behindTheClubContent = {
  sectionId: "behind-the-club",
  content: {
    heading: "Behind the Club",
    subtitle: "Robotics Club MNNIT",
    faculty: [
      { name: "Prof. Rama Shanker Verma", role: "Director", quote: "The first step in inspiring innovation in the classroom is giving educators the space and support to innovate in their own teaching." },
      { name: "Prof. Pritam Singh", role: "SAC President", quote: "Innovation, much like storytelling, is the craft of weaving ideas into reality." },
      { name: "Prof. Asim Mukharjee", role: "Faculty In-Charge Technical Activities", quote: "With precision in mind and creativity at heart, the Robotics Club at MNNIT prepares to leave its mark in the world of intelligent machines." },
      { name: "Prof. Anand Sharma", role: "Faculty Coordinator Robotics Club", quote: "Automation is the symphony of speed, accuracy, and efficiency in the era of Industry 4.0." },
      { name: "Dr. Samir Saraswati", role: "Faculty In-charge & Mentor - Self Driving Car, Associate Professor MED" },
      { name: "Dr. Jitendra Narayan Gangwar", role: "Faculty In-charge & Mentor - Self Driving Car, Assistant Professor Grade-1" },
    ],
    sdcTimeline: [
      { year: 2020, head: "Gaurav Bansal", description: "Kickstarted the Self-Driving Car Project by introducing it to the Robotics Club and beginning initial development." },
      { year: 2021, head: "Bhuvan Jhamb", description: "Initial simulation of autonomous stack in CARLA and roadmap defined." },
      { year: 2022, head: "Ashutosh Kumar", description: "Developed and tested the prototype with the control system successfully established." },
      { year: 2023, head: "Amit Gupta", description: "Work on automation of braking throttle and work on lane detection and algorithms continued." },
      { year: 2024, head: "Ayush Singh Gour", description: "Automation of steering system completed. Mechanical work done. Kitty Dataset collection performed. Work started on odometry." },
      { year: 2025, head: "Rishi Mishra", description: "Odometry done. Integration of road lane detection system and basic decision making system. Sensor integration. Improvement of control system." },
      { year: 2026, head: "Dhruv Chandhok", description: "Current SDC Head." },
    ],
    alumniMentors: [
      { name: "Bhuvan Jhamb", batch: "Alumni, 2020", role: "R&D Engineer, Tesla" },
      { name: "Kishan Tiwari", batch: "Alumni, 2019", role: "Founder, TSAW Drones, India" },
      { name: "Sharad Rawat", batch: "Alumni, 2016", role: "Software Engineer, Germany" },
      { name: "Rohit Garg", batch: "Head Member of MNNIT Alumni Excellence" },
    ],
    sponsors: [
      "MNNIT Alumni Association (MAA)",
      "MNNIT Alumni Excellence (MAE) Foundation — A 1995 Batch Initiative",
    ],
  },
  updatedAt: new Date(),
}

// ═══════════════════════════════════════════════════════
// COORDINATORS (site_content collection)
// ═══════════════════════════════════════════════════════

const coordinatorsContent = {
  sectionId: "coordinators",
  content: {
    heading: "Club Coordinators",
    batches: [
      {
        year: 2025,
        label: "Coordinators '25",
        members: [
          { name: "Anu Priya" },
          { name: "Ayush Verma" },
          { name: "Ashay Jadhav" },
          { name: "Bhanu Pratap Singh" },
          { name: "Devendra Saini" },
          { name: "Rishi Mishra" },
          { name: "Sudhanshu Ranjan" },
          { name: "Sarthak Kumar" },
          { name: "Tushar Kesarwani" },
        ],
      },
      {
        year: 2026,
        label: "Coordinators '26",
        members: [
          { name: "Inam Yadav" },
          { name: "Krishna Gupta" },
          { name: "Kushagra Verma" },
          { name: "Devanshi Gupta" },
          { name: "Ankit Upadhyay" },
          { name: "Mohammad Kaif" },
          { name: "Abdul Basit" },
          { name: "Aman Sharma" },
          { name: "Astha Singh" },
          { name: "Abhay Agarwal" },
          { name: "Dhruv Chandhok" },
          { name: "Aryan Vishwakarma" },
          { name: "Avneesh Sahu" },
        ],
      },
    ],
    nonTech: [
      { name: "Kanishk Agrawal", role: "Design Lead" },
      { name: "Vatsal Kumar", role: "Design Lead" },
      { name: "Rudraksh Mall", role: "Designer" },
      { name: "Rishu Raj", role: "Designer" },
      { name: "Deepak Hadiya", role: "Designer" },
      { name: "Raghav Bansal", role: "Designer" },
      { name: "Gaurab Gupta", role: "Designer" },
      { name: "Ranjan Kumar", role: "Video Lead" },
      { name: "Krishna Garg", role: "Video Lead" },
      { name: "Daksh Katta", role: "Video Editor" },
      { name: "Roli Rathour", role: "Video Editor" },
    ],
  },
  updatedAt: new Date(),
}

// ═══════════════════════════════════════════════════════
// SUMMER PROJECTS (site_content collection)
// ═══════════════════════════════════════════════════════

const summerProjectsContent = {
  sectionId: "summer-projects",
  content: {
    heading: "Summer Projects",
    years: [
      {
        year: "2023-24",
        projects: [
          { title: "Prosthetic Arm", category: "Hardware" },
          { title: "Humanoid", category: "Hardware" },
          { title: "5 DOF Robotic Arm", category: "Hardware" },
          { title: "Spider Bot", category: "Hardware" },
          { title: "ChatBot", category: "Software" },
          { title: "Self Balancing Bot", category: "Hardware" },
          { title: "Cleaner Bot", category: "Hardware" },
          { title: "Defect Product Detection", category: "Software" },
          { title: "RL in Super Mario Bros", category: "Software" },
          { title: "Smart CCTV Surveillance", category: "Software" },
        ],
      },
      {
        year: "2024-25",
        projects: [
          { title: "AI Music Generator", category: "Software" },
          { title: "Aplytic - AI Resume Analyzer", category: "Software" },
          { title: "Robotic Dog", category: "Hardware" },
          { title: "XY Plotter", category: "Hardware" },
          { title: "Sign Language Recognizer", category: "Software" },
          { title: "Swarm Bots", category: "Hardware" },
          { title: "Vision-Guided Rover", category: "Hardware" },
          { title: "Prosthetic Arm Phase 2", category: "Hardware" },
          { title: "Self-Balancing Bike", category: "Hardware" },
          { title: "6-DOF Robotic Arm", category: "Hardware" },
          { title: "Gagan Kavach", category: "Hardware" },
          { title: "Hand Gesture Video Game Controller", category: "Software" },
        ],
      },
    ],
  },
  updatedAt: new Date(),
}

// ═══════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════

async function seed() {
  const client = new MongoClient(URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")
    const db = client.db(DB_NAME)

    // ── Seed Events & Competitions ──
    console.log("\n--- Seeding Events & Competitions ---")

    for (const { event, competitions } of eventsData) {
      const existing = await db.collection("events").findOne({ name: event.name, year: event.year })
      if (existing) {
        console.log(`  [SKIP] Event "${event.name}" (${event.year}) already exists`)
        continue
      }

      const eventDoc = {
        ...event,
        competitions: [],
        createdAt: new Date(),
      }
      const eventResult = await db.collection("events").insertOne(eventDoc)
      const eventId = eventResult.insertedId
      console.log(`  [OK] Event "${event.name}" (${event.year}) → ${eventId}`)

      const compIds = []
      for (const comp of competitions) {
        const compDoc = {
          ...comp,
          eventId,
          teams: [],
        }
        const compResult = await db.collection("competitions").insertOne(compDoc)
        compIds.push(compResult.insertedId)
        console.log(`    [OK] Competition "${comp.title}" → ${compResult.insertedId}`)
      }

      if (compIds.length > 0) {
        await db.collection("events").updateOne(
          { _id: eventId },
          { $set: { competitions: compIds } }
        )
      }
    }

    // ── Seed Site Content ──
    console.log("\n--- Seeding Site Content ---")

    const contentDocs = [
      achievementsContent,
      behindTheClubContent,
      coordinatorsContent,
      summerProjectsContent,
    ]

    for (const doc of contentDocs) {
      const existing = await db.collection("site_content").findOne({ sectionId: doc.sectionId })
      if (existing) {
        await db.collection("site_content").updateOne(
          { sectionId: doc.sectionId },
          { $set: { content: doc.content, updatedAt: new Date() } }
        )
        console.log(`  [UPDATE] site_content "${doc.sectionId}"`)
      } else {
        await db.collection("site_content").insertOne(doc)
        console.log(`  [OK] site_content "${doc.sectionId}"`)
      }
    }

    // ── Summary ──
    const eventCount = await db.collection("events").countDocuments()
    const compCount = await db.collection("competitions").countDocuments()
    const contentCount = await db.collection("site_content").countDocuments()
    console.log(`\n=== Done ===`)
    console.log(`  Events: ${eventCount}`)
    console.log(`  Competitions: ${compCount}`)
    console.log(`  Site Content sections: ${contentCount}`)

  } catch (err) {
    console.error("Seed failed:", err)
    process.exit(1)
  } finally {
    await client.close()
    console.log("Connection closed")
  }
}

seed()
