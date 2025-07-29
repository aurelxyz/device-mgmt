import api from './api-client';

const apiUrl = 'http://localhost:3001';     // TODO

// -----------------------------------------------------------------------------------------
export type DeviceFilters = {
  mac?: string,
  status?: string,
  model?: string,
  type?: string
}

export type DeviceInfo = {
  deviceId: number,
  mac: string,
  status: string
  modelId: number,
  modelName: string,
  typeId: number,
  typeName: string
}

export const getDevices = async (filters: DeviceFilters) => {
  let url = apiUrl + '/devices';
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
export type DeviceAddInfo = {
  mac: string,
  status: string
  modelId: number,
};

export const addDevice = async (info: DeviceAddInfo) => {
  return await api.post(apiUrl + '/devices', info);
}

// -----------------------------------------------------------------------------------------
export const deleteDevice = async (id: number) => {
  return await api.delete(apiUrl + '/devices/' + id);
}

// -----------------------------------------------------------------------------------------
export const modifyDevice = async (id: number, newStatus: string) => {
  return await api.patch(apiUrl + '/devices/' + id, { status: newStatus });
}