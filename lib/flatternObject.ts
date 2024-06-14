import { Moment } from "moment";

export const flatternObject = function (object: any) {
  const flattern: any = {};

  Object.keys(object).forEach((key) => {
    const value = object[key];

    if (!key.endsWith("Id")) {
      if (Array.isArray(value)) {
        // If the value is an array, recursively flatten each element
        value.forEach((item, index) => {
          if (item instanceof Object && !Array.isArray(item)) {
            if ((item as Object).constructor.name.toString() === "Moment") {
              flattern[key] = (item as Moment).format("DD-MM-YYYY");
            } else {
              // If the value is an object, recursively flatten it
              Object.assign(flattern, flatternObject(item));
            }
          } else {
            flattern[`${key}_${index}`] = item;
          }
        });
      } else if (value instanceof Object && !Array.isArray(value)) {
        if ((value as Object).constructor.name.toString() === "Moment") {
          flattern[key] = (value as Moment).format("DD-MM-YYYY");
        } else {
          // If the value is an object, recursively flatten it
          Object.assign(flattern, flatternObject(value));
        }
      } else {
        // Otherwise, assign the key-value pair directly
        flattern[key] = value;
      }
    }
  });

  return flattern;
};

export const flatternArray = (records: any[]) => {
  if (!Array.isArray(records)) return [];
  return records.map((record) => flatternObject(record));
};
