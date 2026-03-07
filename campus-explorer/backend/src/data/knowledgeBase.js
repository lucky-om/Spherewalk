// Comprehensive campus knowledge base for AI assistant
const knowledgeBase = {
  staff: [
    { name: "Dr. Rajesh Sharma", role: "Principal", dept: "Administration", phone: "9876543210", office: "Main Block, Room 101" },
    { name: "Prof. Meena Patel", role: "HOD - Computer Engineering", dept: "Computer Engineering", phone: "9876543211", office: "CS Block, Room 201" },
    { name: "Prof. Suresh Kumar", role: "HOD - Information Technology", dept: "Information Technology", phone: "9876543212", office: "IT Block, Room 301" },
    { name: "Prof. Anita Singh", role: "HOD - Electronics", dept: "Electronics", phone: "9876543213", office: "EC Block, Room 401" },
    { name: "Dr. Priya Nair", role: "HOD - Mechanical", dept: "Mechanical", phone: "9876543214", office: "ME Block, Room 501" },
    { name: "Prof. Ramesh Gupta", role: "Placement Officer", dept: "Training & Placement", phone: "9876543215", office: "Main Block, Room 102" },
    { name: "Mr. Vijay Desai", role: "Librarian", dept: "Library", phone: "9876543216", office: "Library Building" },
    { name: "Dr. Kavita Rao", role: "Dean Academics", dept: "Administration", phone: "9876543217", office: "Main Block, Room 103" },
  ],

  locations: [
    { name: "Computer Lab 1", type: "lab", building: "CS Block", floor: 1, description: "Primary programming lab with 60 systems", x: 320, y: 180, keywords: ["computer lab", "cs lab", "programming lab", "coding"] },
    { name: "Computer Lab 2", type: "lab", building: "CS Block", floor: 2, description: "Advanced computing lab with GPU systems", x: 320, y: 160, keywords: ["computer lab 2", "gpu lab", "advanced lab"] },
    { name: "IT Lab", type: "lab", building: "IT Block", floor: 1, description: "Networking and server lab", x: 420, y: 180, keywords: ["it lab", "network lab", "server room"] },
    { name: "Library", type: "facility", building: "Library Building", floor: 0, description: "Central library with 50,000+ books and digital resources", x: 250, y: 280, keywords: ["library", "books", "reading room"] },
    { name: "Auditorium", type: "facility", building: "Main Block", floor: 0, description: "Capacity 500+, equipped with AV systems", x: 200, y: 150, keywords: ["auditorium", "seminar hall", "event hall"] },
    { name: "Canteen", type: "facility", building: "Canteen Block", floor: 0, description: "Food court with multiple stalls, timings 8am-8pm", x: 350, y: 350, keywords: ["canteen", "food", "cafeteria", "eat", "lunch"] },
    { name: "Parking", type: "facility", building: "Parking Zone", floor: 0, description: "Two-wheeler and four-wheeler parking", x: 150, y: 400, keywords: ["parking", "bikes", "vehicles", "two-wheeler"] },
    { name: "Washroom (CS Block)", type: "facility", building: "CS Block", floor: 1, description: "Washroom near Computer Lab 1", x: 340, y: 200, keywords: ["washroom", "restroom", "toilet", "bathroom"] },
    { name: "Admin Office", type: "office", building: "Main Block", floor: 1, description: "Admissions, fees, certificates", x: 200, y: 180, keywords: ["admin", "office", "admission", "fees", "certificate"] },
    { name: "Placement Cell", type: "office", building: "Main Block", floor: 1, description: "Training and placement office", x: 210, y: 185, keywords: ["placement", "jobs", "recruitment", "internship"] },
    { name: "Medical Room", type: "facility", building: "Main Block", floor: 0, description: "First aid and medical assistance", x: 190, y: 195, keywords: ["medical", "doctor", "first aid", "nurse", "health"] },
    { name: "Main Gate", type: "facility", building: "Entry", floor: 0, description: "Main entrance gate", x: 300, y: 450, keywords: ["main gate", "entrance", "entry", "exit"] },
  ],

  placements: {
    year: "2024-25",
    totalPlaced: 342,
    highestPackage: "₹28 LPA (Google)",
    averagePackage: "₹7.2 LPA",
    topRecruiters: ["Google", "Infosys", "TCS", "Wipro", "Accenture", "Capgemini", "L&T Infotech", "HCL", "HDFC Bank"],
    departments: [
      { name: "Computer Engineering", placed: 98, percent: 92 },
      { name: "Information Technology", placed: 87, percent: 89 },
      { name: "Electronics", placed: 72, percent: 78 },
      { name: "Mechanical", placed: 85, percent: 75 },
    ]
  },

  admission: {
    intake: 240,
    cutoff2024: "MHT-CET: 94.5 percentile (CS), 91.2 (IT)",
    fees: "₹1,10,000/year for CS/IT, ₹95,000/year for others",
    eligibility: "12th Science with PCM, min 45%",
    process: "Maharashtra CET → CAP round allotment → Document verification",
    contact: "9876543219 | admissions@campus.edu",
  },

  events: [
    {
      title: "TechFest 2024",
      date: "March 15-17, 2024",
      venue: "Auditorium + Grounds",
      description: "Annual technical festival with hackathon, robotics, coding contests"
    },
    {
      title: "Campus Placement Drive - Infosys",
      date: "March 20, 2024",
      venue: "Seminar Hall",
      description: "Off-campus placement drive for final year students"
    },
    {
      title: "Guest Lecture: AI in Industry",
      date: "March 12, 2024",
      venue: "Auditorium",
      description: "By Dr. Anand from IIT Bombay"
    }
  ],

  quickFacts: {
    established: 1994,
    affiliation: "Mumbai University",
    accreditation: "NAAC A+, NBA Accredited",
    campus: "25 acres",
    totalStudents: 2800,
    faculty: 180,
    labs: 24,
    hostel: "Available (separate for boys/girls)",
  },

  routes: {
    "main gate to computer lab": ["Enter from Main Gate", "Take the right path toward CS Block", "Walk 200m straight", "CS Block is on your left", "Computer Lab 1 on Ground Floor, Lab 2 on First Floor"],
    "main gate to library": ["Enter from Main Gate", "Walk straight on the central path", "Library building is visible ahead on the left", "Total distance: ~150m"],
    "main gate to canteen": ["Enter Main Gate", "Walk past the Admin Block", "Turn right after the garden", "Canteen block is straight ahead, ~250m"],
    "library to computer lab": ["Exit Library from main door", "Turn right", "Walk 100m to CS Block", "Computer Lab 1 is on Ground Floor"],
  },

  emergency: {
    security: "9876500001",
    medicalRoom: "9876500002",
    fireStation: "101",
    ambulance: "108",
    principalOffice: "9876543210",
  }
};

module.exports = knowledgeBase;
