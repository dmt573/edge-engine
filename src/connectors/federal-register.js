'use strict';

const ENDPOINT = 'https://www.federalregister.gov/api/v1/documents.json';

async function searchDocuments(term = 'cryptocurrency', limit = 20) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('per_page', String(limit));
  url.searchParams.set('order', 'newest');
  url.searchParams.set('conditions[term]', term);
  for (const field of ['title', 'abstract', 'document_number', 'publication_date', 'type', 'html_url', 'agencies']) {
    url.searchParams.append('fields[]', field);
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Federal Register returned HTTP ${response.status}`);
  const payload = await response.json();
  const observedAt = new Date().toISOString();
  return (payload.results || []).map((doc) => ({
    source: 'federal_register',
    sourceId: doc.document_number,
    recordType: 'federal_document',
    title: doc.title || 'Untitled federal document',
    summary: doc.abstract || '',
    url: doc.html_url || `https://www.federalregister.gov/documents/${doc.document_number}`,
    publishedAt: doc.publication_date || null,
    observedAt,
    data: {
      documentNumber: doc.document_number,
      documentType: doc.type || null,
      agencies: (doc.agencies || []).map((agency) => agency.name),
      searchTerm: term,
    },
    limitations: [
      'Search results are discovery records, not legal conclusions.',
      'Verify document status, effective dates, amendments, jurisdiction, and operative text in the original document.',
      'A keyword match does not establish that a document creates a business opportunity.',
    ],
  }));
}

module.exports = { searchDocuments };
