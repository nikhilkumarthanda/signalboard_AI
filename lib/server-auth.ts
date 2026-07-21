export function requestUser(request: Request) {
  const email = request.headers.get("oai-authenticated-user-email")?.trim();
  return email || "demo@signalboard.local";
}
