import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 2, // Low concurrency to avoid hitting rate limits
  duration: '5m',
};

const BASE_URL = 'https://su-search-dev.vercel.app';

const searchTerms = [
  "academic calendar", "email", "canvas", "nursing", "library", "calendar", "parking",
  "jobs", "housing", "tuition", "racial equity summit", "biology bs", "directory",
  "mathematics ba bs", "registrar", "commencement", "bookstore", "summer", "zoom",
  "campus map", "redhawk hub", "student financial services", "map", "sonography",
  "human resources", "psychology", "graduation", "disability services", "campus store",
  "scholarships", "staff directory", "faculty", "biology", "computer science", "iparq",
  "radiology", "athletics", "catalog", "urec", "study abroad", "transcripts",
  "faculty staff directory", "course catalog", "careers",
  "what can i do with this major", "myseattleu", "environmental science bs",
  "ultrasound", "majors", "master in teaching", "marcom", "physics ba bs",
  "lemieux library", "transfer", "facilities", "irb", "mathematics",
  "computer science fundamentals certificate", "masters", "dnp", "cornish",
  "graduate", "rotc", "financial aid", "stu", "campus ministry", "counseling",
  "advising", "student employment", "kinesiology", "learning assistance programs",
  "events", "fellowship", "revision request", "financial services", "handshake",
  "design", "online", "economics ba", "caps", "login", "career engagement", "outlook",
  "isc", "reprographics", "its", "career", "albers", "hr", "social work", "mosaic",
  "mechanical engineering bs", "sfs", "qualtrics", "scholarship", "transcript",
  "career engagement office", "public safety", "mechanical engineering", "philosophy",
  "college of nursing", "gpa", "lap", "marketing", "orientation", "supercopy",
  "employment", "scholarshipuniverse", "academic forms", "courses", "gra", "printing",
  "permit store", "common data set", "dance", "pre college", "phd", "outlook email",
  "alumni", "honors", "payroll", "social security number", "economics", "my seattle u",
  "disability", "business analytics", "work order", "quicklinks", "chrome river",
  "law school", "kinesiology ms", "accounting", "admitted students", "bsn",
  "dean of students", "sport entertainment management mba", "diagnostic ultrasound bs",
  "philosophy ba", "wise form", "data science ms", "education abroad", "career center",
  "data science", "faculty canvas", "cost of attendance", "international student center",
  "portal", "it", "admissions", "forms", "international student and scholar center",
  "albers career center", "parking permit", "business", "environmental studies ba",
  "student health center", "cybersecurity", "cpt", "undergraduate research", "high school",
  "msw", "tour", "cell molecular biology bs", "new core", "tax", "tuition and fees",
  "forms and documents", "issc", "engagesu", "tuition remission", "mailing services",
  "ucor", "housing and residence life", "graduate programs", "clubs", "robotics minor",
  "pre med", "microbiology", "mba", "political science", "art", "parking services",
  "student development administration", "president", "nonprofit leadership",
  "school psychology", "major", "architecture", "summer programs", "timelycare", "cost",
  "financial aid appeal", "scholarship universe", "law", "basketball", "biolo",
  "center for faculty development", "connectsu", "marine conservation biology bs",
  "computer engineering bs", "wcc", "west coast conference"
];

function createSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function getIncrementalQueries(term) {
  const parts = [];
  for (let i = 4; i <= term.length; i++) {
    parts.push(term.slice(0, i));
  }
  return parts;
}

export default function () {
  const sessionId = createSessionId();
  const fullTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const fragments = getIncrementalQueries(fullTerm);

  fragments.forEach(fragment => {
    const url = `${BASE_URL}/search-test?query=${encodeURIComponent(fragment)}&sessionId=${sessionId}`;
    const res = http.get(url);

    check(res, {
      'status is 200': (r) => r.status === 200
    });

    sleep(Math.random() * 1.5 + 0.5); // 0.5 to 2 seconds between keystrokes
  });
}
