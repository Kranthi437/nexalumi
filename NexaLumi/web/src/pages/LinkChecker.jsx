import { useState } from 'react';
import { requestLinkCheck } from '../api/linkCheck.js';
import { Button, Card, Notice, PageTitle } from '../components/ui.jsx';
import { normalizeAndValidateUrl } from '../../../shared/url.js';

const CLASS_STYLES = {
  'Known Malicious': { chip: 'red', icon: '!' },
  Suspicious: { chip: 'amber', icon: '!' },
  'No Known Threat Found': { chip: 'green', icon: '✓' },
  'Unknown / Unable to Check': { chip: 'blue', icon: 'ⓘ' },
};

function formatTimestamp(value) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function LinkChecker() {
  const [value, setValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [requestError, setRequestError] = useState('');
  const [retryable, setRetryable] = useState(false);

  function resetResultState() {
    setResult(null);
    setRequestError('');
    setRetryable(false);
  }

  async function runCheck(rawUrl) {
    const validated = normalizeAndValidateUrl(rawUrl);
    if (!validated.ok) {
      setInputError(validated.error);
      resetResultState();
      return;
    }

    setInputError('');
    setLoading(true);
    setRequestError('');
    setRetryable(false);

    try {
      const data = await requestLinkCheck(rawUrl);
      setResult(data);
    } catch (error) {
      setResult(error.result && error.result.explanation ? error.result : null);
      setRequestError(error.message || 'The check could not be completed.');
      setRetryable(Boolean(error.retryable));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    runCheck(value);
  }

  function handleClear() {
    setValue('');
    setInputError('');
    setLoading(false);
    resetResultState();
  }

  const style = CLASS_STYLES[result?.classification] || CLASS_STYLES['Unknown / Unable to Check'];

  return (
    <>
      <PageTitle
        eyebrow="LINK CHECKER"
        title="Check a website link"
        subtitle="Review an unfamiliar website address before you decide whether to open it."
      />
      <div className="checker-layout">
        <Card className="checker-card">
          <div className="checker-intro">
            <span className="large-tool-icon">↗</span>
            <div>
              <h2>What would you like to review?</h2>
              <p>Paste a website address. NEXALUMI will not open or visit the link for you.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="field" htmlFor="link-checker-url">
              <span>Website address</span>
              <input
                id="link-checker-url"
                name="url"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  if (inputError) setInputError('');
                  resetResultState();
                }}
                placeholder="https://example.com"
                aria-invalid={Boolean(inputError)}
                aria-describedby={inputError ? 'link-checker-url-error' : 'link-checker-url-hint'}
                disabled={loading}
              />
              <small id="link-checker-url-hint">Paste the complete URL, including https://</small>
              {inputError ? (
                <small id="link-checker-url-error" className="field-error" role="alert">
                  {inputError}
                </small>
              ) : null}
            </label>
            <div className="form-actions">
              <Button type="submit" disabled={loading} aria-busy={loading}>
                {loading ? 'Checking…' : 'Check Link'} <span>→</span>
              </Button>
              <button type="button" className="button button-ghost" onClick={handleClear} disabled={loading}>
                Clear
              </button>
              {retryable ? (
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => runCheck(value)}
                  disabled={loading}
                >
                  Retry
                </button>
              ) : null}
            </div>
          </form>
          {requestError ? (
            <p className="field-error" role="alert">
              {requestError}
            </p>
          ) : null}
          <Notice title="How this check works">
            The address is sent to the NEXALUMI backend and, when configured, Google Web Risk for a
            reputation lookup. The submitted website is never opened or crawled. Avoid submitting private
            URLs or links containing access tokens. A result is not a guarantee of safety.
          </Notice>
        </Card>
        <div className="side-stack">
          <Card>
            <h3>Before you continue</h3>
            <ul className="check-list">
              <li>Do not share passwords or one-time passcodes.</li>
              <li>Be cautious with links that arrive unexpectedly.</li>
              <li>Verify unusual payment requests independently.</li>
            </ul>
          </Card>
          <Card className="soft-panel">
            <span className="eyebrow">GOOD TO KNOW</span>
            <h3>A result is not a guarantee.</h3>
            <p>
              Even legitimate-looking websites and messages can be misleading. Always consider the
              context. No known threat found does not guarantee safety.
            </p>
          </Card>
        </div>
      </div>
      {loading ? (
        <Card className="preview-result" aria-live="polite">
          <div className="result-preview-body">
            <div className="result-icon">…</div>
            <div>
              <span className="result-chip blue">Checking</span>
              <h3>Reviewing the website address</h3>
              <p>Please wait while NEXALUMI checks reputation information. The link is not being opened.</p>
            </div>
          </div>
        </Card>
      ) : null}
      {result && !loading ? (
        <Card className="preview-result" aria-live="polite">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CHECK RESULT</span>
              <h2>{result.classification}</h2>
            </div>
          </div>
          <div className="result-preview-body">
            <div className={`result-icon ${style.chip}`}>{style.icon}</div>
            <div>
              <span className={`result-chip ${style.chip}`}>{result.classification}</span>
              <h3>What this means</h3>
              <p>{result.explanation}</p>
            </div>
          </div>
          <div className="result-details">
            <div className="sample-value">
              <strong>Submitted URL</strong>
              <p>{result.submittedUrl}</p>
            </div>
            <div className="sample-value">
              <strong>Normalized hostname</strong>
              <p>{result.hostname || '—'}</p>
            </div>
            <div className="sample-value">
              <strong>Threat intelligence check status</strong>
              <p>
                {result.threatIntel?.statusLabel || 'Unavailable'}
                {result.threatIntel?.provider ? ` · ${result.threatIntel.provider}` : ''}
              </p>
            </div>
            <div className="sample-value">
              <strong>Detection source</strong>
              <p>{result.detectionSource || 'Unavailable'}</p>
            </div>
            {result.threatIntel?.categories?.length ? (
              <div className="sample-value">
                <strong>Detection categories</strong>
                <p>{result.threatIntel.categories.join(', ')}</p>
              </div>
            ) : null}
            {result.heuristicWarnings?.length ? (
              <div className="sample-value">
                <strong>Heuristic warnings</strong>
                <p>
                  These are NEXALUMI pattern warnings, not confirmed threat-intelligence detections.
                </p>
                <ul className="check-list">
                  {result.heuristicWarnings.map((warning) => (
                    <li key={warning.code}>{warning.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="sample-value">
              <strong>Check timestamp</strong>
              <p>{formatTimestamp(result.checkedAt)}</p>
            </div>
            {result.recommendations?.length ? (
              <div className="sample-value">
                <strong>Safety recommendations</strong>
                <ul className="check-list">
                  {result.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}
    </>
  );
}

export default LinkChecker;
