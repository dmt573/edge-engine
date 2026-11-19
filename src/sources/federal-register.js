'use strict';

const ENDPOINT = 'https://www.federalregister.gov/api/v1/documents.json';

async function fetchRecentDocuments(perPage = 50) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('per_page', String(Math.min(Math.max(Number(perPage) || 50, 1), 100)));
  url.searchParams.set('order', 'newest');
  url.searchParams.set('format', 'json');

  const response = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': 'edge-engine/0.2 read-only research' },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Federal Register returned HTTP ${response.status}`);
  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : [];

  return results.map((doc) => ({
    document_number: doc.document_number || '',
    title: doc.title || 'Untitled document',
    abstract: doc.abstract || '',
    type: doc.type || '',
    publication_date: doc.publication_date || null,
    agencies: Array.isArray(doc.agencies) ? doc.agencies.map((a) => a.name).filter(Boolean) : [],
    html_url: doc.html_url || '',
    pdf_url: doc.pdf_url || ''
  }));
}

module.exports = { fetchRecentDocuments };
