import { ApiError } from "../errors/apiError";

async function request(url: string, options: RequestInit) {
  //
  if (!url.startsWith("http")) {
    throw new Error("url must start with http(s)");
  }
  // const urlInstance = new URL(url);
  const response = await fetch(url, {
    ...options,
    // mode: "cors",
    // credentials: "include",
    headers: _createHeaders(options.headers, options.method),
  });

  if (response.ok) {
    const res = await response.json();
    return res;
    // if (res.success) {
    //   return res;
    // } else {
    //   throw new Error(res.message);
    // }
  } else {
    // console.log(response.status);
    try {
      const errorMsg = await response.json();
      if (response.status === 400) {
        throw new ApiError(
          errorMsg.message || errorMsg.code || response.statusText,
          errorMsg.code,
        );
      }
      // TODO: throw error code
      throw new Error(errorMsg.message || errorMsg.code || response.statusText);
    } catch (e) {
      throw e;
    }
  }

  // throw new Error(response.statusText);
}

function _createHeaders(
  headers: HeadersInit = {},
  method?: string,
): HeadersInit {
  //
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
  formatter?: (data: any) => R,
): Promise<R> {
  const res = await request(url, {
    method: "GET",
    ...options,
  });

  if (res.success) {
    if (typeof formatter === "function") {
      return formatter(res.data);
    }
    // Return the required data based on the returned data structure
    if (Array.isArray(res.data["rows"])) {
      return res.data["rows"] as unknown as R;
    }
    return res.data;
  }
  throw new Error(res.message);
}
async function post(
  url: string,
  data: any,
  options?: Omit<RequestInit, "method">,
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
  options?: Omit<RequestInit, "method">,
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
  options?: Omit<RequestInit, "method">,
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

export { get, post, del, put, mutate, request };
