import api from './api-client';

const apiUrl = 'http://localhost:3001';     // TODO

// -----------------------------------------------------------------------------------------
export type DeviceTypeFilters = {
  name?: string,
}

export type DeviceType = {
  typeId: number,
  typeName: string,
}

export const getDeviceTypes = async (filters: DeviceTypeFilters) => {
  let url = apiUrl + '/device-types';
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

// -----------------------------------------------------------------------------------------
export type DeviceTypeAddInfo = {
  name: string,
};

export const addDeviceType = async (info: DeviceTypeAddInfo) => {
  return await api.post(apiUrl + '/device-types', info);
}

// -----------------------------------------------------------------------------------------
export const deleteDeviceType = async (id: number) => {
  return await api.delete(apiUrl + '/device-types/' + id);
}