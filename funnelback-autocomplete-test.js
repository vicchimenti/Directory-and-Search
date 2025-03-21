import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 10, // Simulating 10 concurrent users
  duration: '1m', // Run for 1 minute
};

const BASE_URL = 'https://funnelback-proxy-dev.vercel.app/proxy';
const SUGGEST_URL = `${BASE_URL}/funnelback/suggest`;
const SUGGEST_PEOPLE_URL = `${BASE_URL}/suggestPeople`;
const SUGGEST_PROGRAMS_URL = `${BASE_URL}/suggestPrograms`;
const SEARCH_URL = `${BASE_URL}/funnelback/search`;
const ANALYTICS_CLICK_URL = `${BASE_URL}/analytics/click`;

// Your full list of 200 search keywords
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

// Generate a sessionId similar to the frontend
function createSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

// Simulates typing a query incrementally
function generateIncrementalQueries(term) {
  let queries = [];
  for (let i = 3; i <= term.length; i++) {
    queries.push(term.substring(0, i));
  }
  return queries;
}

export default function () {
  const sessionId = createSessionId();
  const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const incrementalQueries = generateIncrementalQueries(searchTerm);

  incrementalQueries.forEach((query, index) => {
    // Hit the suggestion endpoints
    const suggestParams = `?partial_query=${encodeURIComponent(query)}&collection=seattleu~sp-search&profile=_default&sessionId=${sessionId}`;
    const peopleParams = `?query=${encodeURIComponent(query)}&sessionId=${sessionId}`;
    const programsParams = `?query=${encodeURIComponent(query)}&collection=seattleu~ds-programs&profile=_default&sessionId=${sessionId}`;

    let responses = http.batch([
      ['GET', `${SUGGEST_URL}${suggestParams}`],
      ['GET', `${SUGGEST_PEOPLE_URL}${peopleParams}`],
      ['GET', `${SUGGEST_PROGRAMS_URL}${programsParams}`],
    ]);

    // Check if suggestions returned successfully
    check(responses[0], { 'General suggestions returned': (r) => r.status === 200 });
    check(responses[1], { 'People suggestions returned': (r) => r.status === 200 });
    check(responses[2], { 'Program suggestions returned': (r) => r.status === 200 });

    sleep(0.5); // Simulate real typing delay

    // Simulate selecting a suggestion (random chance at final step)
    if (index === incrementalQueries.length - 1 && Math.random() > 0.5) {
      const selectedSuggestion = query;
      const clickData = JSON.stringify({
        originalQuery: searchTerm,
        clickedUrl: `${SEARCH_URL}?query=${encodeURIComponent(selectedSuggestion)}`,
        clickedTitle: selectedSuggestion,
        clickType: 'suggestion',
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      });

      let res = http.post(ANALYTICS_CLICK_URL, clickData, {
        headers: { 'Content-Type': 'application/json' }
      });

      check(res, { 'Click logged': (r) => r.status === 200 });

      sleep(0.5);
    }
  });

  // Final search request after suggestions
  const searchParams = `?query=${encodeURIComponent(searchTerm)}&collection=seattleu~sp-search&profile=_default&form=partial&sessionId=${sessionId}`;
  let searchRes = http.get(`${SEARCH_URL}${searchParams}`);

  check(searchRes, { 'Final search returned results': (r) => r.status === 200 });

  sleep(2);
}
