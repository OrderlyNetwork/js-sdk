const fs = require("fs");
const path = require("path");
const { MARKETPLACE_API_BASE_URL } = require("./constants");

const AUTH_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".orderly",
);
const AUTH_FILE = path.join(AUTH_DIR, "auth.json");

function ensureAuthDir() {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
}

function readAuth() {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
    }
  } catch (e) {
    // Ignore errors, return empty
  }
  return null;
}

function writeAuth(data) {
  ensureAuthDir();
  fs.writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2));
}

function saveToken(token, email = null) {
  writeAuth({ token, email });
}

function saveOAuthToken(tokenData) {
  // Use email if available, otherwise use username
  writeAuth({
    token: tokenData.token,
    refreshToken: tokenData.refreshToken || null,
    email: tokenData.email || null,
    username: tokenData.username || null,
    avatarUrl: tokenData.avatarUrl || null,
    loginMethod: "github",
    loginAt: new Date().toISOString(),
  });
}

function getToken() {
  const auth = readAuth();
  return auth?.token || null;
}

function getEmail() {
  const auth = readAuth();
  // Prefer email, fall back to username
  return auth?.email || auth?.username || null;
}

function getRefreshToken() {
  const auth = readAuth();
  return auth?.refreshToken || null;
}

/**
 * Rotate CLI tokens using refresh token and persist new credentials.
 */
async function refreshCliToken() {
  const auth = readAuth();
  const refreshToken = auth?.refreshToken;
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(
      `${MARKETPLACE_API_BASE_URL}/auth/refresh-cli`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data?.accessToken || !data?.refreshToken) {
      return null;
    }

    writeAuth({
      ...auth,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      refreshedAt: new Date().toISOString(),
    });
    return data.accessToken;
  } catch {
    return null;
  }
}

/**
 * Send authenticated request and retry once after token refresh on 401.
 */
async function authenticatedFetch(url, init = {}) {
  const token = getToken();
  if (!token) {
    return fetch(url, init);
  }

  const firstHeaders = new Headers(init.headers || {});
  firstHeaders.set("Authorization", `Bearer ${token}`);
  let response = await fetch(url, { ...init, headers: firstHeaders });
  if (response.status !== 401) {
    return response;
  }

  const nextToken = await refreshCliToken();
  if (!nextToken) {
    return response;
  }

  const retryHeaders = new Headers(init.headers || {});
  retryHeaders.set("Authorization", `Bearer ${nextToken}`);
  response = await fetch(url, { ...init, headers: retryHeaders });
  return response;
}

function isLoggedIn() {
  const token = getToken();
  return !!token;
}

function logout() {
  if (fs.existsSync(AUTH_FILE)) {
    fs.unlinkSync(AUTH_FILE);
  }
}

module.exports = {
  saveToken,
  saveOAuthToken,
  getToken,
  getEmail,
  getRefreshToken,
  isLoggedIn,
  logout,
  authenticatedFetch,
  refreshCliToken,
};
