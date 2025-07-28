
type DeviceFilters = {
  mac?: string,
  status?: string,
  model?: string,
  type?: string
}

export const getDevices = async (filters: DeviceFilters) => {
  let url = 'http://localhost:3001/devices';
  if (filters) {
    const query = Object.entries(filters)
      .filter(([key, val]) => val)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join('&');
    if (query) {
      url += '?' + query;
    }
  }
  
  const res = await fetch(url);     // TODO: localhost
  const data = await res.json();
  return data;
}
