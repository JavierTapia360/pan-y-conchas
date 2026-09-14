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
  | 'begin_checkout'
  | 'purchase'
  | 'selection_add'
  | 'selection_remove'
  | 'selection_open'
  | 'selection_share';
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
  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    body: JSON.stringify(detail),
  }).catch(() => {});
  window.dispatchEvent(new CustomEvent('cuatesfarmz:analytics', { detail }));
}
