export function apiError(code: string, message: string, status = 400, details?: unknown) {
  const reference = crypto.randomUUID();
  return Response.json({ success: false, code, message, reference, ...(details ? { details } : {}) }, { status });
}

export function apiSuccess<T extends Record<string, unknown>>(data: T, init?: ResponseInit) {
  return Response.json({ success: true, ...data }, init);
}

export function isSameOriginMutation(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}
