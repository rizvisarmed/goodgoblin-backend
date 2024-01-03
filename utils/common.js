const sendResponse = (res, statusCode = 200, data, message) => {
  let responseObj = data;
  if (message) {
    responseObj = {
      message,
      ...(data && (data.data ? data : { data })),
    };
  }
  return res.status(statusCode).json(responseObj);
};

const getPagination = async (
  model,
  page = 1,
  pageSize = 10,
  sortOrder = "asc",
  sortField,
  include
) => {
  const skip = (page - 1) * pageSize;
  const data = await model.findMany({
    skip,
    take: parseInt(pageSize),
    orderBy: {
      ...(sortField && { [sortField]: sortOrder }),
    },
    ...(include && { include }),
  });
  const count = await model.count();
  const totalPages = Math.ceil(count / pageSize);

  return {
    data,
    currentPage: page,
    pageSize,
    totalPages,
    totalRecords: count,
  };
};

const convertToCamelCase = (str) => {
  return str.toLowerCase().replace(/\s+/g, "");
};

module.exports = {
  sendResponse,
  getPagination,
  convertToCamelCase,
};
