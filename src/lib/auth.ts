const ADMIN_SESSION_KEY = "admin_session";

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function setAdminAuthenticated(value: boolean): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADMIN_SESSION_KEY, value ? "true" : "false");
}

export function verifyAdminCredentials(
  username: string,
  password: string
): boolean {
  const expectedUser = process.env.NEXT_PUBLIC_ADMIN_USER ?? "admin";
  const expectedPass = process.env.NEXT_PUBLIC_ADMIN_PASS ?? "admin123";
  return username === expectedUser && password === expectedPass;
}
