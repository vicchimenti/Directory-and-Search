import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 10, // More users to stress the app
  duration: '5m',
};

const BASE_URL = 'https://su-search-dev.vercel.app';

// Helper to generate random strings
function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:<>,.?/';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function createSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

export default function () {
  const sessionId = createSessionId();
  const randomQuery = randomString(Math.floor(Math.random() * 10) + 5); // Random string 5-15 chars

  const url = `${BASE_URL}/search-test?query=${encodeURIComponent(randomQuery)}&sessionId=${sessionId}`;

  const res = http.get(url);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'no major errors': (r) => r.status < 500
  });

  sleep(Math.random() * 1 + 0.3); // 0.3s to 1.3s between each request
}
