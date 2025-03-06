export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

export const HTTP_STATUS_MESSAGES = {
  OK: "Success",
  CREATED: "Resource created successfully",
  BAD_REQUEST: "Invalid request",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  SERVER_ERROR: "Internal server error",
};



export const responseHandler = (res, status, message, data = null) => {
  const success = status >= 200 && status < 300 ? true : false;
  return res.json({
    success,
    status,
    message,
    data,
  });
};
