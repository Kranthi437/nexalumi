import { createGoogleWebRiskProvider } from './googleWebRisk.js';

export function createThreatIntelProvider(options = {}) {
  if (options.provider) return options.provider;
  return createGoogleWebRiskProvider(options);
}

export { createGoogleWebRiskProvider };
