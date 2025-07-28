export const getDevices = async () => {
  const res = await fetch('http://localhost:3001/devices');
  const data = await res.json();
  return data;
}