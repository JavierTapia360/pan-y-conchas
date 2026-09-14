'use client';
import { useEffect } from 'react';
type WebTool = { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute(input: unknown): Promise<unknown> };
declare global { interface Document { modelContext?: { registerTool(tool: WebTool, options?: { signal?: AbortSignal }): void | Promise<void> } } }
export function WebMcpTools() {
  useEffect(() => {
    if (!document.modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const tool: WebTool = {
      name: 'subscribe_newsletter', title: 'Subscribe to CUATESFARMZ updates', description: 'Subscribe a consenting adult visitor to general CUATESFARMZ email updates. This never creates an order.',
      inputSchema: { type: 'object', properties: { email: { type: 'string', format: 'email' }, language: { type: 'string', enum: ['es', 'en'] }, consent: { const: true } }, required: ['email', 'language', 'consent'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        const value = input as { email?: string; language?: string; consent?: boolean };
        if (!value.email || !value.email.includes('@') || value.consent !== true || !['es', 'en'].includes(value.language || '')) throw new Error('VALID_EMAIL_AND_CONSENT_REQUIRED');
        const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) });
        if (!response.ok) throw new Error('SUBSCRIPTION_FAILED');
        return { subscribed: true, language: value.language };
      },
    };
    try { void Promise.resolve(document.modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch {}
    return () => lifecycle.abort();
  }, []);
  return null;
}
