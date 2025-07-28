import api from './api-client';

type DeviceFilters = {
  mac?: string,
  status?: string,
  model?: string,
  type?: string
}

export const getDevices = async (filters: DeviceFilters) => {
  let url = 'http://localhost:3001/devices';                          // TODO: localhost
  if (filters) {
    const query = Object.entries(filters)
      .filter(([key, val]) => val)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join('&');
    if (query) {
      url += '?' + query;
    }
  }
  
  const data = await api.get(url);
  return data;
}
