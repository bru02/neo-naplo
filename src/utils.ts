export default function group(arr: any[], key: any): any {
  const result = {};
  if (!arr) return result;
  arr.forEach(item => {
    if (!result.hasOwnProperty(item[key])) {
      result[item[key]] = [];
    }
    result[item[key]].push(item);
  });
  return result;
}
async function fromCache(resource: string): Promise<any> {
  const cache = await window.caches.open('api-cache');
  if (!cache) return null;
  const cachedResponse = await cache.match(`/api/${resource}`);
  if (!cachedResponse) return null;
  const data = await cachedResponse.json();
  console.log(data);
  return data;
}
export { fromCache };
