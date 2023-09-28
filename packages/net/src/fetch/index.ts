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
    headers: _createHeaders(options.headers, options.method),
  });

  if (response.ok) {
    const res = await response.json();
    if (res.success) {
      return res;
    } else {
      throw new Error(res.message);
    }
  }

  throw new Error(response.statusText);
}

function _createHeaders(
  headers: HeadersInit = {},
  method?: string
): HeadersInit {
  // console.log("headers", headers);
  const _headers = new Headers(headers);
  // _headers.append("Accept", "application/json");

  if (!_headers.has("Content-Type")) {
    if (method !== "DELETE") {
      _headers.append("Content-Type", "application/json;charset=utf-8");
    } else {
      _headers.append("Content-Type", "application/x-www-form-urlencoded");
    }
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

async function put(
  url: string,
  data: any,
  options?: Omit<RequestInit, "method">
): Promise<any> {
  const res = await request(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });

  return res;
}

async function del(
  url: string,
  options?: Omit<RequestInit, "method">
): Promise<any> {
  const res = await request(url, {
    method: "DELETE",
    ...options,
  });

  return res;
}

async function mutate(url: string, init: RequestInit) {
  const res = await request(url, init);

  return res;
}

export { get, post, del, put, mutate };
