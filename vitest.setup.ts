import '@testing-library/jest-dom/vitest';

// Ensure fetch API globals exist in the test environment.
if (typeof fetch === 'undefined' || typeof Response === 'undefined') {
  const undici = await import('undici');
  if (typeof fetch === 'undefined') {
    // @ts-ignore
    globalThis.fetch = undici.fetch;
  }
  if (typeof Response === 'undefined') {
    // @ts-ignore
    globalThis.Response = undici.Response;
  }
}
