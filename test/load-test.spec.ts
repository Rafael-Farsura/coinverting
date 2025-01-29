import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 100 },
    { duration: '20s', target: 1000 },
    { duration: '20s', target: 1000 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_reqs: ['count>1000'],
  },
};

export default function () {
  const res = http.get(
    'http://localhost:3000/currency/convert?from=USD&to=EUR&amount=100',
  );
  check(res, {
    'status é 200': (r) => r.status === 200,
  });

  sleep(0.1);
}
