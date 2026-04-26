/* Coded by Lucky */
/* SphereWalk — AI Knowledge Base Seeder */
const db = require('./src/data/db');

db.prepare('DELETE FROM campus_info').run();
console.log('Cleared old campus_info entries');

const entries = [
  // FEES
  { category: 'Fees', title: 'Admission Fees 2024-25', content: 'Annual tuition fees at SCET:\n- Computer Engineering (CE): Rs 1,10,000 per year\n- Information Technology (IT): Rs 1,10,000 per year\n- Electronics & Communication (EC): Rs 95,000 per year\n- Mechanical Engineering (ME): Rs 95,000 per year\nAdditional: Exam fees Rs 5,000/year, library deposit Rs 2,000 (refundable). Hostel: Rs 60,000-80,000/year with food.' },
  { category: 'Fees', title: 'Fee Payment Process', content: 'Fees can be paid online at fees.scet.ac.in or at the Admin Office (Main Block, Ground Floor). Modes: NEFT, UPI, Demand Draft. Odd semester deadline: July 31. Even semester deadline: January 15. Late fee Rs 50 per day after due date.' },
  { category: 'Fees', title: 'Scholarships and Fee Waivers', content: 'Merit scholarship: Top 5% students get 50% fee waiver. Government scholarships cover full tuition for ST/SC/EBC students. Minority scholarship also available. Apply at Admin Office with income certificate and marksheets.' },

  // ADMISSIONS
  { category: 'Admissions', title: 'Admission Process 2024', content: 'Admission via MHT-CET or JEE Main scores.\nSteps: 1) Appear for MHT-CET / JEE Main. 2) Register on DTE Maharashtra portal (dtemaharashtra.gov.in). 3) Fill CAP form. 4) Attend CAP round allotment. 5) Report to college with original documents. Cutoff 2024: CS/IT ~94.5 percentile (MHT-CET), EC/ME ~88 percentile.' },
  { category: 'Admissions', title: 'Eligibility for Admission', content: 'Eligibility: 12th Science (PCM) with minimum 45% marks (40% for reserved category). Must have valid MHT-CET or JEE Main score. Lateral entry (direct 2nd year): Diploma in relevant branch with 45% marks.' },
  { category: 'Admissions', title: 'Documents Required for Admission', content: 'Required documents: 10th and 12th marksheets, MHT-CET/JEE scorecard, caste certificate (if applicable), income certificate, domicile certificate, migration certificate (if from other board), 6 passport photos, Aadhaar card copy. Contact: 9876543219 | admissions@scet.ac.in' },

  // STAFF
  { category: 'Staff', title: 'Principal - Dr. Rajesh Sharma', content: 'Dr. Rajesh Sharma is the Principal. Office: Main Block, Room 101. Phone: 9876543210. Office hours: Mon-Sat, 10am-5pm. Qualifications: PhD in CS from IIT Bombay. 25+ years of academic experience.' },
  { category: 'Staff', title: 'HOD Computer Engineering - Prof. Meena Patel', content: 'Prof. Meena Patel is the Head of Department for Computer Engineering. Office: CS Block, Room 201. Phone: 9876543211. Specialization: Machine Learning, Data Structures. Office hours: 9am-4pm (Mon-Fri).' },
  { category: 'Staff', title: 'HOD Information Technology - Prof. Suresh Kumar', content: 'Prof. Suresh Kumar is the HOD for Information Technology. Office: IT Block, Room 301. Phone: 9876543212. Specialization: Network Security, Cloud Computing.' },
  { category: 'Staff', title: 'Placement Officer - Prof. Ramesh Gupta', content: 'Prof. Ramesh Gupta manages Training and Placement. Office: Main Block, Room 102. Phone: 9876543215. Email: placement@scet.ac.in. He coordinates campus drives, internships, and industry partnerships.' },

  // PLACEMENTS
  { category: 'Placements', title: 'Placement Statistics 2024-25', content: 'SCET Placement 2024-25: Total placed: 342 of 410 eligible. Highest package: Rs 28 LPA (Google). Average package: Rs 7.2 LPA. Placement rate: CS 92%, IT 89%, EC 78%, ME 75%. Top recruiters: Google, Infosys, TCS, Wipro, Accenture, Capgemini, L&T Infotech, HCL, HDFC Bank.' },

  // FACILITIES
  { category: 'Facilities', title: 'Library', content: 'Central Library (Library Building, Ground Floor). Timings: 8am-8pm (Mon-Sat), 10am-5pm (Sun). Collection: 50,000+ books, 200+ journals, IEEE/Springer/Elsevier digital access. Seating: 200. Wi-Fi enabled. Librarian: Mr. Vijay Desai, Phone: 9876543216.' },
  { category: 'Facilities', title: 'Computer Labs', content: 'Computer Lab 1 (CS Block, Floor 1): 60 Dell workstations, Intel i7, 16GB RAM. Software: VS Code, Eclipse, MATLAB, Oracle DB. Lab 2 (CS Block, Floor 2): 40 GPU-equipped systems for ML/AI. IT Lab (IT Block, Floor 1): Cisco networking equipment. Lab timings: 9am-6pm Mon-Sat.' },
  { category: 'Facilities', title: 'Hostel', content: 'Separate hostels for boys (300 capacity) and girls (200 capacity). Annual fee including meals: Rs 60,000-80,000. Amenities: Wi-Fi, laundry, TV room, gym. Warden: 9876543220 (Boys), 9876543221 (Girls).' },
  { category: 'Facilities', title: 'Canteen', content: 'Campus canteen (Canteen Block). Timings: 8am-8pm daily. Offers veg and non-veg meals, snacks, beverages. Average meal: Rs 30-80. Stalls include South Indian, Chinese, and fast food. Juice counter and bakery also available.' },

  // GENERAL
  { category: 'General', title: 'About SCET', content: 'Sarvajanik College of Engineering and Technology (SCET) established in 1994. Affiliation: Veer Narmad South Gujarat University (VNSGU). Accreditation: NAAC A+, NBA Accredited. Campus: 25 acres. Students: 2800+. Faculty: 180+. Labs: 24. Located in Surat, Gujarat.' },
  { category: 'General', title: 'Academic Calendar', content: 'Academic year: July to May. Odd semester: July-November. Even semester: December-May. Mid-sem exams: September and February. End-sem exams: November and May. Summer vacation: June. Diwali break: 2 weeks in October-November.' },
  { category: 'General', title: 'Wi-Fi and Internet', content: 'Campus-wide Wi-Fi across all blocks. Network: SCET_Campus. Password available at Admin Office or IT Lab. Speed: 1 Gbps fiber connection. Hostel Wi-Fi available 6am-11pm.' },
];

const insert = db.prepare('INSERT INTO campus_info (category, title, content) VALUES (?, ?, ?)');
const insertAll = db.transaction((items) => {
  for (const item of items) insert.run(item.category, item.title, item.content);
});
insertAll(entries);
console.log('Seeded ' + entries.length + ' knowledge entries successfully');
