import HttpException from "./HttpException";
 
class BookStatusException extends HttpException {
  constructor(id:string, status: string) {
    super(409, `Book with isbn ${id} is already ${status}. Please make sure is the correct isbn of the Book or contact the librarian.`);
  }
}
 
export default BookStatusException;