import HttpException from "./HttpException";
 
class BookNotFoundException extends HttpException {
  constructor(id: string) {
    super(404, `Book with isbn ${id} not found for given lender. Please make sure Book exists and is borrowed by this lender.`);
  }
}
 
export default BookNotFoundException;