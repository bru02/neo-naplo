export default function group(arr: any[], key: any): any {
  const result = {};
  arr.forEach(item => {
    if (!result.hasOwnProperty(item[key])) {
      result[item[key]] = [];
    }
    result[item[key]].push(item);
  });
  return result;
}
