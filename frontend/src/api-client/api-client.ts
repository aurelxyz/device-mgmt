import * as appStore from '../stores/app-store';


const makeFetchRequest = (method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE') => 
  async (route: string, data?: any) => {
    const req = {
      method,
      headers: {
        "Content-Type": "application/json",
        'X-API-KEY': appStore.get().apiKey ?? ''
      },
      body: JSON.stringify(data)
    }
    const res = await fetch(route, req);

    // Will intentionally throw an error if the HTTP response code is not OK (>= 400)
    // The Error message takes the value of the property "message" in the JSON object returned in the response body
    if (!res.ok) { 
      const body = await res.json();
      throw new Error(body.message || `API_ERROR_${res.status}`);
    }

    // Some API methods do not return json or return an empty response, hence the try-catch to avoid the "Unexpected end of JSON input" errors
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return await res.json();
      } catch (e) {
        return null;
      }
    } else {
      return null;
    }
  };

const api = {
  get: makeFetchRequest('GET'),
  post: makeFetchRequest('POST'),
  put: makeFetchRequest('PUT'),
  patch: makeFetchRequest('PATCH'), 
  delete: makeFetchRequest('DELETE')
}

export default api;
