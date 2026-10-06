const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function signUpApi(data: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  password?: string;
}) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function signInApi(data: {
  email: string;
  password?: string;
}) {
  const res = await fetch(`${API_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function signOutApi() {
  const res = await fetch(`${API_URL}/api/auth/signout`, {
    method: 'POST',
    credentials: 'include',
  });
  return await res.json();
}

export async function getCurrentUserApi() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  return await res.json();
}

export async function getReportsApi() {
  const res = await fetch(`${API_URL}/api/reports`, {
    method: 'GET',
    credentials: 'include',
  });
  const json = await res.json();
  return json.data || [];
}

export async function addReportApi(report: any) {
  const res = await fetch(`${API_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(report),
  });
  return await res.json();
}

export async function verifyReportApi(id: string) {
  const res = await fetch(`${API_URL}/api/reports/${id}/verify`, {
    method: 'PATCH',
    credentials: 'include',
  });
  return await res.json();
}
