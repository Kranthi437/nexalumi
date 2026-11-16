import { resolveTxt } from 'node:dns/promises';

function flatten(records = []) { return records.map((parts) => parts.join('')); }
function extractAddress(value = '') {
  const angle = value.match(/<([^>]+)>/);
  const candidate = (angle?.[1] || value).trim();
  const match = candidate.match(/[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})/i);
  return match ? { address: candidate, domain: match[1].toLowerCase() } : null;
}

function resolveWithTimeout(resolver, name, timeoutMs = 2500) {
  let timer;
  return Promise.race([resolver(name), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('DNS lookup timed out')), timeoutMs); })]).finally(() => clearTimeout(timer));
}

export async function inspectEmailAuthentication(rawEmail, resolver = resolveTxt) {
  const fromHeader = rawEmail.match(/^From:\s*(.+)$/im)?.[1] || '';
  const sender = extractAddress(fromHeader);
  if (!sender) return { checked: false, reason: 'A valid From email address was not found in the supplied headers.' };
  const domain = sender.domain;
  const [spfResult, dmarcResult] = await Promise.allSettled([
    resolveWithTimeout(resolver, domain), resolveWithTimeout(resolver, `_dmarc.${domain}`),
  ]);
  const spfRecords = spfResult.status === 'fulfilled' ? flatten(spfResult.value).filter((value) => /^v=spf1\b/i.test(value)) : [];
  const dmarcRecords = dmarcResult.status === 'fulfilled' ? flatten(dmarcResult.value).filter((value) => /^v=DMARC1\b/i.test(value)) : [];
  const authResults = rawEmail.match(/^Authentication-Results:\s*(.+)$/im)?.[1] || '';
  const dkimSelector = authResults.match(/\bdkim=\w+\s+header\.d=([^;\s]+).*?header\.s=([^;\s]+)/i);
  let dkim = { status: 'not_verified', note: 'A DKIM selector was not present in the supplied Authentication-Results header.' };
  if (dkimSelector) {
    try {
      const records = flatten(await resolveWithTimeout(resolver, `${dkimSelector[2]}._domainkey.${dkimSelector[1]}`));
      dkim = { status: records.some((record) => /v=DKIM1|p=/i.test(record)) ? 'record_found' : 'not_found', note: 'DNS record presence only; the message signature itself was not cryptographically verified.' };
    } catch { dkim = { status: 'not_found', note: 'The DKIM selector DNS record could not be retrieved.' }; }
  }
  return {
    checked: true, senderDomain: domain,
    spf: { status: spfRecords.length ? 'record_found' : 'not_found', records: spfRecords },
    dmarc: { status: dmarcRecords.length ? 'record_found' : 'not_found', records: dmarcRecords },
    dkim,
    note: 'DNS record presence is not proof that this email passed SPF, DKIM or DMARC. The receiving mail server Authentication-Results header must be trusted and the DKIM signature must be verified.'
  };
}
