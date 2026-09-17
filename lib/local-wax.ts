export const LOCAL_WAX_KEY = 'gf_wax_local_v1';
export const LOCAL_WAX_EVENT = 'gf-wax-local-change';

export type LocalWaxSettings = {
  available: boolean;
  updatedAt: string | null;
};

export const defaultLocalWaxSettings: LocalWaxSettings = {
  available: true,
  updatedAt: null,
};

export function normalizeLocalWaxSettings(value: unknown): LocalWaxSettings {
  if (!value || typeof value !== 'object') return defaultLocalWaxSettings;
  const candidate = value as Partial<LocalWaxSettings>;
  return {
    available:
      typeof candidate.available === 'boolean'
        ? candidate.available
        : defaultLocalWaxSettings.available,
    updatedAt:
      typeof candidate.updatedAt === 'string' ? candidate.updatedAt : null,
  };
}

export function readLocalWaxSettings(): LocalWaxSettings {
  if (typeof window === 'undefined') return defaultLocalWaxSettings;
  try {
    return normalizeLocalWaxSettings(
      JSON.parse(window.localStorage.getItem(LOCAL_WAX_KEY) || 'null'),
    );
  } catch {
    return defaultLocalWaxSettings;
  }
}

export function writeLocalWaxAvailability(available: boolean) {
  const next: LocalWaxSettings = {
    available,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(LOCAL_WAX_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(LOCAL_WAX_EVENT));
  return next;
}
