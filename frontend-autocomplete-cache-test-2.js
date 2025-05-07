import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 3,
  duration: '5m',
};

const BASE_URL = 'https://su-search-dev.vercel.app/api/suggestions';

const searchTerms = [
  "academic calendar", "email", "canvas", "nursing", "library", "calendar", "parking",
  "jobs", "housing", "tuition", "biology", "directory", "registrar", "zoom",
  "faculty", "staff directory", "catalog", "transcripts", "majors", "course catalog"
  // ...you can extend this as needed
];

export default function () {
  const query = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const params = new URLSearchParams({
    query: query,
    collection: 'seattleu~sp-search',
    profile: '_default'
  });

  const url = `${BASE_URL}?${params.toString()}`;

  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'not empty': (r) => r.body && r.body.length > 10
  });

  sleep(Math.random() * 2 + 1); // 1 to 3 seconds
}
