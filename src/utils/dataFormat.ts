export const groupByProperty = (
  data: Record<string, any>[],
  objectKey: string
) => {
  // find unique values of the objectKey
  const uniqueValues = [...new Set(data.map((item) => item[objectKey]))];

  // create an object to store the grouped data
  const groupedData = uniqueValues.reduce((acc, value) => {
    acc[value] = data.filter((item) => item[objectKey] === value);
    return acc;
  }, {});
  return groupedData;
};
