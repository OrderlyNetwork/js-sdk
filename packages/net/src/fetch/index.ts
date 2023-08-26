async function request(url: string, options: RequestInit) {
  // console.log("request", url, options);
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
  // console.log("headers", headers);
  const _headers = new Headers(headers);
  // _headers.append("Accept", "application/json");

  if (!_headers.has("Content-Type")) {
    _headers.append("Content-Type", "application/json;charset=utf-8");
  }

  return _headers;
}

async function get<R>(
  url: string,
  options?: RequestInit,
  formatter?: (data: any) => R
): Promise<R> {
  const res = await request(url, {
    method: "GET",
    ...options,
  });

  if (res.success) {
    if (typeof formatter === "function") {
      return formatter(res.data);
    }
    // 根据返回的数据结构，返回需要的数据
    if (Array.isArray(res.data["rows"])) {
      return res.data["rows"] as R;
    }
    return res.data;
  }
  throw new Error(res.message);
}
async function post(
  url: string,
  data: any,
  options?: Omit<RequestInit, "method">
): Promise<any> {
  const res = await request(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });

  return res;
}

export { get, post };
