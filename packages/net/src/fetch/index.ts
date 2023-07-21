function baseFetch(url: string, options: RequestInit) {
  return fetch(url, options);
}

function _createHeaders(headers: HeadersInit) {}

function get(url: string): Promise<any> {
  return baseFetch(url, {
    method: "GET",
  });
}
function post(url: string): Promise<any> {
  return baseFetch(url, {
    method: "POST",
  });
}

export { get, post };
