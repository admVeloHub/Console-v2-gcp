// VERSION: v1.0.0 | DATE: 2026-05-29 | AUTHOR: VeloHub Development Team
/** Backend VeloHub (portal) — distinto do SKYNET (Console API). */

export const DEFAULT_DEV_VELOHUB_API_ORIGIN = 'http://localhost:8090';
export const DEFAULT_PROD_VELOHUB_API_ORIGIN = 'https://velohub-278491073220.us-east1.run.app';

const normalizeBaseUrl = (url) => String(url || '').trim().replace(/\/api\/?$/, '');

/**
 * @returns {string} URL base com sufixo /api
 */
export function getResolvedVelohubApiUrl() {
  const _runtime = typeof window !== 'undefined' ? window.__VELOHUB_RUNTIME_CONFIG__ : undefined;
  const fromRuntime = _runtime?.REACT_APP_VELOHUB_API_URL;
  const fromEnv = process.env.REACT_APP_VELOHUB_API_URL;

  let origin = normalizeBaseUrl(fromRuntime || fromEnv);
  if (!origin) {
    origin =
      process.env.NODE_ENV === 'development'
        ? DEFAULT_DEV_VELOHUB_API_ORIGIN
        : DEFAULT_PROD_VELOHUB_API_ORIGIN;
  }

  if (
    typeof window !== 'undefined' &&
    origin.includes('localhost') &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    const urlObj = new URL(origin.startsWith('http') ? origin : `http://${origin}`);
    origin = `${urlObj.protocol}//${window.location.hostname}:${urlObj.port || '8090'}`;
  }

  return `${origin.replace(/\/+$/, '')}/api`;
}
