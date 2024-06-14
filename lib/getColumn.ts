export default function getColumn(item: object, key: string) {
  let obj = Array.isArray(item) ? item[0] : item;

  const keys = key.split(".");
  // Traverse through the object using the keys
  let result = obj;
  for (const key of keys) {
    result = result[key];
    // If any key in the path is undefined, return undefined
    if (result === undefined) return result;
  }
  return result;
}
