import {
  CLASSIFICATIONS,
  THREAT_INTEL_STATUS,
} from '../../../shared/classifications.js';
import { normalizeAndValidateUrl } from '../../../shared/url.js';
import { evaluateHeuristics } from './heuristics.js';
import { createThreatIntelProvider } from './threatIntel/index.js';

const CATEGORY_LABELS = {
  MALWARE: 'Malware',
  SOCIAL_ENGINEERING: 'Social engineering',
  UNWANTED_SOFTWARE: 'Unwanted software',
};

function statusLabel(status) {
  switch (status) {
    case THREAT_INTEL_STATUS.COMPLETED:
      return 'Completed';
    case THREAT_INTEL_STATUS.MISSING_API_KEY:
      return 'Not configured';
    case THREAT_INTEL_STATUS.TIMEOUT:
      return 'Timed out';
    case THREAT_INTEL_STATUS.RATE_LIMITED:
      return 'Rate limited';
    case THREAT_INTEL_STATUS.UNAVAILABLE:
      return 'Unavailable';
    default:
      return 'Skipped';
  }
}

function buildExplanation({ classification, intel, heuristicWarnings }) {
  if (classification === CLASSIFICATIONS.KNOWN_MALICIOUS) {
    const categories = intel.categories.map((item) => CATEGORY_LABELS[item] || item);
    const list = categories.length ? ` Categories reported: ${categories.join(', ')}.` : '';
    return `Google Web Risk identified this address as malicious.${list} This is a confirmed threat-intelligence detection, not a NEXALUMI heuristic.`;
  }

  if (classification === CLASSIFICATIONS.SUSPICIOUS) {
    return 'Google Web Risk did not report a matching threat, but NEXALUMI heuristics found concerning characteristics in the address. Heuristic warnings are not confirmed detections.';
  }

  if (classification === CLASSIFICATIONS.NO_KNOWN_THREAT) {
    return 'Google Web Risk completed a lookup and reported no matching threat. No known threat found does not guarantee safety. The website could still be harmful, newly created, or targeting you in another way.';
  }

  if (intel.status === THREAT_INTEL_STATUS.MISSING_API_KEY) {
    return 'The threat intelligence provider is not configured, so NEXALUMI cannot establish a reputation result. This is not a safety clearance.';
  }

  if (intel.status === THREAT_INTEL_STATUS.TIMEOUT) {
    return 'The threat intelligence lookup timed out, so the result cannot be established. This is not a safety clearance.';
  }

  if (intel.status === THREAT_INTEL_STATUS.RATE_LIMITED) {
    return 'The threat intelligence provider rate-limited this check, so the result cannot be established. This is not a safety clearance.';
  }

  if (intel.status === THREAT_INTEL_STATUS.UNAVAILABLE) {
    return 'The threat intelligence provider was unavailable or returned an unexpected response, so the result cannot be established. This is not a safety clearance.';
  }

  if (heuristicWarnings.length) {
    return 'The address could not be fully checked. Heuristic warnings are shown for awareness and are not confirmed threat detections.';
  }

  return 'The address could not be checked, so no safety conclusion is available.';
}

function buildRecommendations(classification) {
  const shared = [
    'Do not enter passwords, one-time passcodes or payment details until you are confident the destination is genuine.',
    'No known threat found does not mean a website is safe.',
  ];

  if (classification === CLASSIFICATIONS.KNOWN_MALICIOUS) {
    return [
      'Do not open this address.',
      'Do not download files or sign in if you already visited it.',
      'If you arrived here from a message, contact the sender through a channel you already trust.',
      ...shared.slice(1),
    ];
  }

  if (classification === CLASSIFICATIONS.SUSPICIOUS) {
    return [
      'Pause before visiting this address.',
      'Check the website name carefully for extra words, unusual spellings or unexpected endings.',
      'Verify the destination through an official app or a contact method you already use.',
      ...shared,
    ];
  }

  if (classification === CLASSIFICATIONS.UNKNOWN) {
    return [
      'Treat this as unchecked, not safe.',
      'Try the check again if the service was temporarily unavailable.',
      'Verify unexpected links through a trusted channel before you continue.',
      ...shared,
    ];
  }

  return [
    'Still consider who sent the link and whether you were expecting it.',
    'Verify important requests using a phone number, app or website you already trust.',
    ...shared,
  ];
}

function detectionSource(classification, intel) {
  if (classification === CLASSIFICATIONS.KNOWN_MALICIOUS) return intel.provider;
  if (classification === CLASSIFICATIONS.SUSPICIOUS) return 'NEXALUMI heuristics';
  if (intel.ok && intel.status === THREAT_INTEL_STATUS.COMPLETED) return intel.provider;
  return 'Unavailable';
}

export function createLinkChecker({
  provider,
  heuristicRules,
  timeoutMs,
  getApiKey,
} = {}) {
  const threatIntel = createThreatIntelProvider({
    provider,
    timeoutMs,
    getApiKey,
  });

  return {
    async check(rawUrl) {
      const validated = normalizeAndValidateUrl(rawUrl);
      if (!validated.ok) {
        return {
          ok: false,
          statusCode: 400,
          result: {
            submittedUrl: rawUrl == null ? '' : String(rawUrl).trim(),
            normalizedUrl: '',
            hostname: '',
            classification: CLASSIFICATIONS.UNKNOWN,
            threatIntel: {
              status: THREAT_INTEL_STATUS.SKIPPED,
              statusLabel: statusLabel(THREAT_INTEL_STATUS.SKIPPED),
              provider: threatIntel.name || 'Google Web Risk',
              matched: false,
              categories: [],
            },
            detectionSource: 'Unavailable',
            heuristicWarnings: [],
            checkedAt: new Date().toISOString(),
            explanation: validated.error,
            recommendations: [
              'Enter a complete http or https website address.',
              'Unsupported addresses such as javascript:, file: or data: cannot be checked.',
            ],
            retryable: false,
            error: validated.error,
            errorCode: validated.code,
          },
        };
      }

      const heuristicWarnings = evaluateHeuristics(validated.parsed, {
        rules: heuristicRules,
      });

      const intel = await threatIntel.lookup(validated.normalizedUrl);
      const categories = intel.ok ? intel.categories : [];

      let classification = CLASSIFICATIONS.UNKNOWN;
      if (intel.ok && intel.matched) {
        classification = CLASSIFICATIONS.KNOWN_MALICIOUS;
      } else if (intel.ok && heuristicWarnings.length) {
        classification = CLASSIFICATIONS.SUSPICIOUS;
      } else if (intel.ok) {
        classification = CLASSIFICATIONS.NO_KNOWN_THREAT;
      }

      const retryable =
        !intel.ok &&
        (intel.status === THREAT_INTEL_STATUS.TIMEOUT ||
          intel.status === THREAT_INTEL_STATUS.RATE_LIMITED ||
          intel.status === THREAT_INTEL_STATUS.UNAVAILABLE);

      return {
        ok: true,
        statusCode: 200,
        result: {
          submittedUrl: validated.submittedUrl,
          normalizedUrl: validated.normalizedUrl,
          hostname: validated.hostname,
          classification,
          threatIntel: {
            status: intel.status,
            statusLabel: statusLabel(intel.status),
            provider: intel.provider || 'Google Web Risk',
            matched: Boolean(intel.matched),
            categories: categories.map((item) => CATEGORY_LABELS[item] || item),
          },
          detectionSource: detectionSource(classification, intel),
          heuristicWarnings,
          checkedAt: new Date().toISOString(),
          explanation: buildExplanation({ classification, intel, heuristicWarnings }),
          recommendations: buildRecommendations(classification),
          retryable,
        },
      };
    },
  };
}
