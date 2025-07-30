export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function setAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
