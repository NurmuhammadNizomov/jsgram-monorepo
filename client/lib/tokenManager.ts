/** In-memory access token store — not localStorage, safe from XSS */
let _token: string | null = null;

export const tokenManager = {
  get: () => _token,
  set: (t: string | null) => { _token = t; },
  clear: () => { _token = null; },
};
