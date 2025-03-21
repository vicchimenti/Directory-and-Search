import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 50,
  duration: '30s',
};

const BASE_URL = 'https://funnelback-proxy-dev.vercel.app/proxy/funnelback/search';

const searchTerms = [
  'admissions', 'engineering', 'scholarships', 'tuition',
  'study abroad', 'MBA', 'campus map', 'financial aid',
  'internships', 'housing', 'student life', 'library'
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
