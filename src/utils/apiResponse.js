class apiResponse {
  constructor(statusCode, count = null, data = null, message = "") {
    this.statusCode = statusCode;
    this.success = statusCode < 400;

    this.count = count;
    this.data = data;
    this.message = message;

    this.timestamp = new Date().toISOString();
  }
}


export { apiResponse }