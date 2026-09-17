import { saveLocalAnalytics } from '@/lib/local-admin-store';

export type AnalyticsEvent =
  | 'page_view'
  | 'language_switch'
  | 'view_product'
  | 'gallery_interaction'
  | 'video_play'
  | 'video_complete'
  | 'share'
  | 'contact_open'
  | 'contact_submit'
  | 'newsletter_signup'
  | 'view_item'
  | 'add_to_cart'
  | 'order_request';
export const ANALYTICS_CONSENT_KEY = 'gf_analytics_consent_v1';

export function hasAnalyticsConsent() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

export function track(
  event: AnalyticsEvent,
  properties: Record<string, string> = {},
) {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  const detail = { event, properties, path: window.location.pathname };
  try {
    saveLocalAnalytics(event, detail.path, properties);
  } catch {
    /* Analytics remains optional when browser storage is unavailable. */
  }
  window.dispatchEvent(new CustomEvent('cuatesfarmz:analytics', { detail }));
}
