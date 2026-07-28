/**
 * SSE stream consumption for the ICM backend.
 *
 * The backend's event contract is stable and must be preserved:
 *   event: documents   -> JSON array of source records (emitted BEFORE generation)
 *   event: token       -> a chunk of answer text
 *   event: error       -> {"error": "..."}
 * Plus a legacy envelope fallback: {token|documents|error} on an unnamed event.
 *
 * Deliberately framework-agnostic: no React, no DOM.
 */

const dataField = (line) => (line.startsWith('data: ') ? line.slice(6) : line.slice(5));

export async function consumeSSE(body, onEvent) {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const parseBlock = (block) => {
    let eventType = 'message';
    const dataLines = [];
    for (const line of block.split(/\r?\n/)) {
      if (!line) continue;
      if (line.startsWith(':')) continue;
      if (line.startsWith('event:')) eventType = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(dataField(line));
    }
    if (eventType === 'keepalive' || eventType === 'ping') return;
    const data = dataLines.join('\n');
    if (data) onEvent(eventType, data);
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() || '';
    for (const b of blocks) parseBlock(b);
  }
  if (buffer.trim()) {
    try { parseBlock(buffer); } catch { /* trailing partial block */ }
  }
}

export function interpretEvent(eventType, data) {
  if (eventType === 'token') return { kind: 'token', value: data };
  if (eventType === 'documents') {
    try { return { kind: 'documents', value: JSON.parse(data) }; } catch { return null; }
  }
  if (eventType === 'error') {
    try { return { kind: 'error', value: JSON.parse(data).error || 'Unknown error' }; }
    catch { return { kind: 'error', value: 'Unknown error' }; }
  }
  try {
    const payload = JSON.parse(data);
    if (Array.isArray(payload.documents)) return { kind: 'documents', value: payload.documents };
    if (typeof payload.token === 'string') return { kind: 'token', value: payload.token };
    if (payload.error) return { kind: 'error', value: payload.error };
    return null;
  } catch {
    return { kind: 'token', value: data };
  }
}
