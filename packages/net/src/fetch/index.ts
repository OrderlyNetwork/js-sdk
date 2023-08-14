async function request(url: string, options: RequestInit) {
  if (!url.startsWith("http")) {
    throw new Error("url must start with http(s)");
  }
  const urlInstance = new URL(url);
  const response = await fetch(urlInstance, {
    ...options,
    // mode: "cors",
    // credentials: "include",
    headers: _createHeaders(options.headers),
  }).catch((err) => {
    throw new Error(err);
  });

  if (response.ok) {
    return response.json();
  }
  throw new Error(response.statusText);
}

function _createHeaders(headers: HeadersInit = {}): HeadersInit {
  const _headers = new Headers(headers);
  // _headers.append("Accept", "application/json");

  if (!_headers.has("Content-Type")) {
    _headers.append("Content-Type", "application/json;charset=utf-8");
  }

  return _headers;
}

async function get(url: string, options?: RequestInit): Promise<unknown> {
  const res = await request(url, {
    method: "GET",
    ...options,
  });

  if (res.success) {
    return res.data;
  }
  throw new Error(res.message);
}
async function post(
  url: string,
  data: any,
  options?: Omit<RequestInit, "method">
): Promise<any> {
  return request(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });
}

export { get, post };
