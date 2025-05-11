const { chromium } = require('playwright');

const searchTerms = [
  "biology", "nursing", "library", "tuition", "transcripts", "registrar",
  "parking", "psychology", "scholarships", "study abroad", "biology",
  "nursing", "academic calendar", "email", "biology bs", "calendar",
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
  "kinesiology", "law", "wcc", "west coast conference", "cornish", "cornish college of the arts",
  "cornish college", "cornish college of the arts seattle", "cornish college of the arts admissions"
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const term of searchTerms) {
    await page.goto('https://www.seattleu.edu/search/', { waitUntil: 'domcontentloaded' });

    const input = await page.locator('#autocomplete-concierge-inputField');
    await input.fill(''); // Clear previous
    await input.type(term, { delay: 100 }); // Simulate typing

    // Wait for suggestions to be fetched and cache to warm
    await page.waitForTimeout(1500);

    console.log(`✔ Wrote: ${term}`);

    await page.waitForTimeout(500); // Small gap before next term
  }

  await browser.close();
})();
