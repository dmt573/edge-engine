'use strict';

const $ = (selector) => document.querySelector(selector);
const pct = (value) => value === null || value === undefined ? '—' : `${(value * 100).toFixed(1)}%`;
const number = (value) => Number(value || 0).toLocaleString();

async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
  return data;
}

function safe(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
}

function renderMatches(data) {
  $('#market-count').textContent = number(data.markets_count);
  $('#document-count').textContent = number(data.documents_count);
  $('#match-count').textContent = number(data.matches_count);
  $('#fetched-at').textContent = `Fetched ${new Date(data.fetched_at).toLocaleString()}`;
  $('#errors').hidden = !data.errors.length;
  $('#errors').innerHTML = data.errors.map((e) => `<div>${safe(e.source)}: ${safe(e.message)}</div>`).join('');
  if (!data.matches.length) {
    $('#matches').innerHTML = '<p class="empty">No keyword matches met the minimum overlap threshold. This is not evidence that no relationship exists.</p>';
    return;
  }
  $('#matches').innerHTML = data.matches.map((m) => `
    <article class="match-card">
      <h3>${safe(m.market.title)}</h3>
      <p><strong>Public record:</strong> ${safe(m.evidence.title)}</p>
      <p>${safe((m.evidence.abstract || '').slice(0, 360))}${m.evidence.abstract?.length > 360 ? '…' : ''}</p>
      <div>${m.matched_terms.map((term) => `<span class="tag">${safe(term)}</span>`).join('')}</div>
      <div class="match-meta">
        <span>Match score: ${m.score}</span>
        <span>Market probability: ${pct(m.market.probability)}</span>
        <span>Volume: ${number(m.market.volume)}</span>
        <span>Published: ${safe(m.evidence.publication_date || 'unknown')}</span>
        ${m.market.url ? `<a href="${safe(m.market.url)}" target="_blank" rel="noopener noreferrer">Market ↗</a>` : ''}
        ${m.evidence.url ? `<a href="${safe(m.evidence.url)}" target="_blank" rel="noopener noreferrer">Source ↗</a>` : ''}
        <button class="use-market" data-ticker="${safe(m.market.ticker)}" data-title="${safe(m.market.title)}" data-probability="${m.market.probability ?? ''}">Forecast this</button>
      </div>
    </article>`).join('');
  document.querySelectorAll('.use-market').forEach((button) => button.addEventListener('click', () => {
    const form = $('#forecast-form');
    form.elements.market_ticker.value = button.dataset.ticker;
    form.elements.market_title.value = button.dataset.title;
    form.elements.market_probability.value = button.dataset.probability === '' ? '' : (Number(button.dataset.probability) * 100).toFixed(1);
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
}

async function loadForecasts() {
  const data = await api('/api/forecasts');
  $('#resolved-count').textContent = number(data.resolved_count);
  $('#brier-score').textContent = data.brier_score === null ? '—' : data.brier_score.toFixed(4);
  if (!data.forecasts.length) {
    $('#forecast-list').innerHTML = '<p class="empty">No forecasts recorded.</p>';
    return;
  }
  $('#forecast-list').innerHTML = data.forecasts.map((f) => `
    <article class="forecast-card">
      <h3>${safe(f.market_title)} <span class="tag">${safe(f.market_ticker)}</span></h3>
      <p>Your probability: <strong>${pct(f.forecast_probability)}</strong> · Market at entry: ${pct(f.market_probability_at_entry)}</p>
      <p>${safe(f.thesis)}</p>
      <div class="match-meta"><span>Created: ${new Date(f.created_at).toLocaleString()}</span><span>Status: ${f.resolved_outcome === null ? 'Open' : f.resolved_outcome === 1 ? 'Resolved YES' : 'Resolved NO'}</span></div>
      ${f.resolved_outcome === null ? `<div class="match-meta"><button class="resolve" data-id="${f.id}" data-outcome="1">Resolve YES</button><button class="resolve" data-id="${f.id}" data-outcome="0">Resolve NO</button></div>` : ''}
    </article>`).join('');
  document.querySelectorAll('.resolve').forEach((button) => button.addEventListener('click', async () => {
    if (!confirm(`Record outcome ${button.dataset.outcome === '1' ? 'YES' : 'NO'}? This updates the local paper ledger.`)) return;
    await api(`/api/forecasts/${button.dataset.id}/resolve`, { method: 'POST', body: JSON.stringify({ outcome: Number(button.dataset.outcome) }) });
    await loadForecasts();
  }));
}

$('#scan-button').addEventListener('click', async () => {
  const button = $('#scan-button');
  button.disabled = true; button.textContent = 'Scanning…';
  try { renderMatches(await api('/api/scan')); }
  catch (error) { $('#errors').hidden = false; $('#errors').textContent = error.message; }
  finally { button.disabled = false; button.textContent = 'Scan public sources'; }
});

$('#forecast-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const marketPct = form.elements.market_probability.value;
  const payload = {
    market_ticker: form.elements.market_ticker.value,
    market_title: form.elements.market_title.value,
    market_probability_at_entry: marketPct === '' ? null : Number(marketPct) / 100,
    forecast_probability: Number(form.elements.forecast_probability.value) / 100,
    thesis: form.elements.thesis.value
  };
  try {
    await api('/api/forecasts', { method: 'POST', body: JSON.stringify(payload) });
    form.reset();
    await loadForecasts();
  } catch (error) { alert(error.message); }
});

(async () => {
  try {
    const health = await api('/api/health');
    $('#app-health').textContent = `Local application: ${health.status} · ${health.mode} · ${new Date(health.checked_at).toLocaleString()}`;
    await loadForecasts();
  } catch (error) { $('#app-health').textContent = `Application error: ${error.message}`; }
})();
