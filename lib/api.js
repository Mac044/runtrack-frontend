import { auth } from "./firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function authedFetch(path, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  const token = await user.getIdToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export function saveRun(runData) {
  return authedFetch("/runs", {
    method: "POST",
    body: JSON.stringify(runData),
  });
}

export function getRuns() {
  return authedFetch("/runs");
}

export function getRunStats() {
  return authedFetch("/runs/stats");
}