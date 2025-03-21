import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 50, // Simulates 50 concurrent users
  duration: '30s', // Runs for 30 seconds
};

const BASE_URL = 'https://funnelback-proxy-dev.vercel.app/proxy/funnelback/search';

// Your 200 top search keywords
const searchTerms = [
  "biology", "nursing", "academic calendar", "email", "biology bs", "calendar",
  "canvas", "bio", "final exam schedule", "commencement", "psychology", "academic",
  "aca", "physics", "biol", "finals schedule", "housing", "jobs", "library",
  "parking", "course catalog", "nur", "zoom", "registrar", "biolo", "education",
  "wise form", "campus map", "media", "computer science course schedule", "finals",
  "redhawk hub", "com", "directory", "majors", "tuition", "biolog", "tra", "film",
  "transfer", "fin", "nurse", "gra", "transcripts", "best career for engineers",
  "computer science", "economics", "revision request", "chimenti", "faculty", "stu",
  "radiology", "honors", "programs", "tax", "outlook", "teaching", "rotc", "cornish",
  "david boness phd", "sharepoint", "exam schedule", "summer", "social work", "music",
  "pro", "acad", "sonography", "graduation", "final exam", "undergraduate", "myseattleu",
  "phy", "katie", "college of nursing", "campus", "map", "redhawk", "human resources",
  "pre", "seattle u", "criminal justice classes", "mttl", "work order", "art",
  "catalog", "staff directory", "albers", "facilities", "fac", "disability services",
  "joyce cubelo", "seattle u finals", "office of sponsored projects", "scholarships",
  "sports", "engineering", "academic c", "minors", "physics ba bs", "cam", "mosaic",
  "cal", "hrl", "hrl members", "science", "urec", "visit", "graduate", "mba", "careers",
  "und", "reg", "acade", "ema", "undergraduate admissions", "supercopy", "bsn",
  "visits", "irb", "dean of students", "final", "206 296", "athletics", "dnp", "forms",
  "economics ba", "sch", "onl", "bookstore", "its", "ultrasound", "transcript", "mls",
  "internships", "civil engineering", "phys", "albers school of business economics",
  "reprographics", "mit", "directions to campus", "events", "eaccounts", "writing center",
  "chrome river", "206 220", "online clinical mental health counseling",
  "cost of attendance", "ultrasound technician", "spring 2025", "computer", "printing",
  "school counseling", "disability", "college of education", "mission", "biology ba",
  "academic cal", "car", "student financial services", "spring quarter", "redhawk fund",
  "campus store", "wise", "business card form", "campus card", "3d printing",
  "cherry street market", "permit store", "study abroad", "ppt", "tour", "president",
  "staff", "architecture", "msw", "alumni", "bulogy", "computer science ms",
  "mechanical engineering", "edu", "mas", "job", "alb", "eng", "forms and documents",
  "tuition remission", "room reservation", "isa galligar", "e accounts", "pre med",
  "careers at seattle university", "controllers office", "costco scholars",
  "statistics tutors", "principal post master certificate", "accounting", "philosophy",
  "kinesiology", "law"
];

// Generate a sessionId similar to your frontend
function createSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

export default function () {
  const randomQuery = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const sessionId = createSessionId();

  const params = {
    query: randomQuery,
    collection: 'seattleu~sp-search',
    profile: '_default',
    form: 'partial',
    sessionId: sessionId,
  };

  const url = `${BASE_URL}?${Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')}`;

  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'body is not empty': (r) => r.body && r.body.length > 0,
  });

  sleep(Math.random() * 2);
}
