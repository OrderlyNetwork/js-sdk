async function request(url: string, options: RequestInit) {
  if (!url.startsWith("http")) {
    throw new Error("url must start with http(s)");
  }
  const urlInstance = new URL(url);
  const response = await fetch(url, {
    ...options,
    headers: _createHeaders(options.headers),
  });

  if (response.ok) {
    return response.json();
  }
  throw new Error(response.statusText);
}

function _createHeaders(headers: HeadersInit = {}): HeadersInit {
  const _headers = new Headers(headers);
  if (!_headers.has("Content-Type")) {
    _headers.append("Content-Type", "application/json");
  }

  return _headers;
}

function get(url: string, options?: any): Promise<any> {
  return request(url, {
    method: "GET",
  });
}
function post(url: string, data: any, options?: any): Promise<any> {
  return request(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export { get, post };
