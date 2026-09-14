export const LOCAL_MESSAGES_KEY = 'gf_messages_local_v1';
export const LOCAL_ANALYTICS_KEY = 'gf_analytics_local_v1';
export const LOCAL_NEWSLETTER_KEY = 'gf_newsletter_local_v1';
export const LOCAL_ADMIN_EVENT = 'gf-admin-local-change';

export type LocalMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  state?: string;
  subject: string;
  message: string;
  language: 'es' | 'en';
  status: 'NEW' | 'READ' | 'ARCHIVED';
  createdAt: string;
};

export type LocalAnalyticsEntry = {
  id: string;
  event: string;
  path: string;
  properties: Record<string, string>;
  createdAt: string;
};

function readArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(LOCAL_ADMIN_EVENT));
}

export const readLocalMessages = () =>
  readArray<LocalMessage>(LOCAL_MESSAGES_KEY);
export const readLocalAnalytics = () =>
  readArray<LocalAnalyticsEntry>(LOCAL_ANALYTICS_KEY);

export function saveLocalMessage(
  message: Omit<LocalMessage, 'id' | 'status' | 'createdAt'>,
) {
  const next: LocalMessage = {
    ...message,
    id: crypto.randomUUID(),
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };
  writeArray(LOCAL_MESSAGES_KEY, [next, ...readLocalMessages()].slice(0, 250));
}

export function updateLocalMessageStatus(
  id: string,
  status: LocalMessage['status'],
) {
  writeArray(
    LOCAL_MESSAGES_KEY,
    readLocalMessages().map((item) =>
      item.id === id ? { ...item, status } : item,
    ),
  );
}

export function saveLocalAnalytics(
  event: string,
  path: string,
  properties: Record<string, string>,
) {
  const next: LocalAnalyticsEntry = {
    id: crypto.randomUUID(),
    event,
    path,
    properties,
    createdAt: new Date().toISOString(),
  };
  writeArray(
    LOCAL_ANALYTICS_KEY,
    [next, ...readLocalAnalytics()].slice(0, 2500),
  );
}

export function saveLocalSubscriber(email: string, language: 'es' | 'en') {
  const current = readArray<{
    email: string;
    language: string;
    createdAt: string;
  }>(LOCAL_NEWSLETTER_KEY);
  if (current.some((item) => item.email.toLowerCase() === email.toLowerCase()))
    return;
  writeArray(LOCAL_NEWSLETTER_KEY, [
    { email, language, createdAt: new Date().toISOString() },
    ...current,
  ]);
}

export function removeLocalSubscriber(email: string) {
  const current = readArray<{
    email: string;
    language: string;
    createdAt: string;
  }>(LOCAL_NEWSLETTER_KEY);
  writeArray(
    LOCAL_NEWSLETTER_KEY,
    current.filter((item) => item.email.toLowerCase() !== email.toLowerCase()),
  );
}
