import HttpException from "./HttpException";
 
class QueryParameterException extends HttpException {
  constructor(param: string, message: string) {
    super(400, `Invalid parameter ${param}. ${message}`);
  }
}
 
export default QueryParameterException;