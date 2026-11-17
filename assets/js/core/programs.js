// The 8 branches of BK LearnX. Edit here if a name or semester count changes.
// Used by the Registration form (program + semester dropdowns).
// The Home page cards in index.html are plain HTML (so Google can read them): keep them in sync with this list.
// Python, Java and IoT subjects are PGDCA subjects (see supabase/seed/courses.example.sql).
window.BK_PROGRAMS = [
  { slug: "pgdca", name: "PGDCA", full: "Post Graduate Diploma in Computer Applications", semesters: [1, 2, 3, 4] },
  { slug: "dsml", name: "DSML", full: "Data Science and Machine Learning", semesters: [1, 2] },
  { slug: "cyber-security", name: "Cyber Security", full: "Security concepts and digital protection", semesters: [1, 2] },
  { slug: "web-designing", name: "Web Designing", full: "Web development and design fundamentals", semesters: [1, 2] },
  { slug: "iot", name: "IoT", full: "Internet of Things", semesters: [1, 2] },
  { slug: "drone-technology", name: "Drone Technology", full: "Drone concepts, technology and applications", semesters: [1, 2] },
  { slug: "chn", name: "CHN", full: "Computer Hardware and Networking", semesters: [1, 2] },
  { slug: "pgda", name: "PGDA", full: "Post Graduate Diploma in Accounting", semesters: [1, 2] }
];
