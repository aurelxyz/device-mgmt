import api from './api-client';

const apiUrl = 'http://localhost:3001';     // TODO

// -----------------------------------------------------------------------------------------
export type DeviceModelFilters = {
  name?: string,
  type?: string
}

export type DeviceModel = {
  modelId: number,
  modelName: string,
  typeId: number,
  typeName: string,
}

export const getDeviceModels = async (filters: DeviceModelFilters) => {
  let url = apiUrl + '/device-models';
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
export type DeviceModelAddInfo = {
  name: string
  typeId: number,
};

export const addDeviceModel = async (info: DeviceModelAddInfo) => {
  return await api.post(apiUrl + '/device-models', info);
}

// -----------------------------------------------------------------------------------------
export const deleteDevice = async (id: number) => {
  return await api.delete(apiUrl + '/device-models/' + id);
}