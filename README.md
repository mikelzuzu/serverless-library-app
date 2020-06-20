# serverless-library-app

## About

Serverless app to emulate librarian job and a self-service borrowing endpoints.
This app is created for de Capstone project for Udacity's cloud developer nanodegree program.

## Functionality of the application

This application will allow creating and fetching categories of the books. Besides we will be able to create/remove/update/fetch and search by words BOOK items.
Moreover, the librarian (the administrator) is able to fetch all the books that exist and check all the status. On the other hand, the lender will be able to 

Moreover, there are endpoint that should be protected using role based access and allow just the librarian or administrator to access to them. For example there is an endpoint to retrieve all books that should be just for the librarian. This endpoint uses scan as the librarian is not concern about performance. Creating, deleting and updating details of the book must be just responsibility of the librarian as well. There is another endpoint as well to be able to update the status of the book passing the lenderId of the person who is borrowing the book as well as the date and status. After creating a book, we could upload a picture for this book.

On the other hand,  the librarian is able to search for available books within a category or all the books in that category (in case the book that the lender wants is borrowed but he/she might want to wait for it). The lender is able to update the status of the book that is borrowing/returning as well with his/her credentials.

At the moment anyone who is authenticate in the app and has the endpoints can do all those thing but this is one of the future improvements to be done. We could limit the scope of the tokens as well to handle this, there are different valid approaches.

## Stack involved
### Authentication 
This is done using OAuth 2.0 protocol. The provider used here is the same as in the course, Auth0. A new application was created here with asymmetric cryptography (private key + public certificate).

### Backend
This is a serverless application, which is using serverless framework to easily create the cloud formation template and deploy in AWS.
AWS resources used:
- API Gateway
- Lambda functions
- IAM roles
- DynamoDB
- ElasticSearch
- S3 Buckets
- CloudWatch (for logs)
- CodeDeploy

 
## How to run the application

### Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v --aws-profile serverless
```

### Postman collection

A postman collection is included to test the backend with already backed authorization tokens that needs to be updated.
To import this collection, do the following.

Click on the import button:

![Alt text](screenshots/postman/import-collection-1.png?raw=true "Image 1")


Click on the "Choose Files":

![Alt text](screenshots/postman/import-collection-2.png?raw=true "Image 2")


Select a file to import:

![Alt text](screenshots/postman/import-collection-3.png?raw=true "Image 3")


Right click on the imported collection to set variables for the collection:

![Alt text](screenshots/postman/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](screenshots/postman/import-collection-5.png?raw=true "Image 5")

## BOOKS items

Each BOOK item contains the following fields:

* `isbn` (string) - a unique id for an item
* `categoryId` (string) - a unique id for category
* `createdAt` (string) - date and time when an item was created
* `title` (string) - title of a BOOK item (e.g. "Don Quixote")
* `author` (string) - author of a BOOK item (e.g. "Don Quixote")
* `publishedDate` (string) - date and time when the BOOK was published / will be published
* `borrowed` (boolean) - true if an item is borrowed, false otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a BOOK item
* `lenderId` (string) (optional) - lender id with the BOOK item is borrowed
* `borrowedDate` (string) (optional) - the date that the BOOK was borrowed

## CATEGORY items

Each CATEGORY item contains the following fields:

* `id` (string) - a unique id for an item
* `name` (string) - name of the category
* `description` (string) - description of the category
* `timestamp` (string) - date and time when an item was created


## Request Validator
There are request models added with pattern or at least a minimum length for this project. For categories:
- Name has to be between 1 and 20 characters
- The description needs to at least contain one character
For the books:
- The isbn has a validator format for isb-10 or isbn-13
- Name of the title has to start with letter and can be followed by more letters, numbers, whitespaces, hyphen, colon, semicolon, underscore
- Name of the author has to start with letter and can be followed by more letters, numbers, whitespaces, hyphen or underscore
- publishedDate has a pattern of YYYY-MM-DD and it start from 1900-01-01. This accepts leap years so we are able to use 2024-02-29 but not 2023-02-29 neither 2024-02-30
When updating the book:
- lenderId needs to be longer than one character
- borrowed is a boolean
- borrowedDate has a pattern of YYYY-MM-DD and it start from 1900-01-01. This accepts leap years so we are able to use 2024-02-29 but not 2023-02-29 neither 2024-02-30

## Pagination
There is a pagination develop for getting the list of books. If no limit is pass through the query parameters, there is a default limit of 5.
Unfortunately, the client does not have implemented this option so it will show a maximun of 5 Books. The is a possibility of using postman (collection can be found in the repo).
`https://{{apiId}}.execute-api.{{apiregion}}.amazonaws.com/dev/admin/books?limit=10&nextKey=`

## Elasticsearch 
The only parameters that I decided to index were isbn, categoryId, publishedDate, createdAt, title and author. This data can be search using the following endpoint. It will try to search in the title and author fields:
`https://{{apiId}}.execute-api.{{apiregion}}.amazonaws.com/dev/books/search?query={query}`

## X-Ray
This is the graph using postman.
![Alt text](screenshots/full-xray.png?raw=true "X-Ray")
![Alt text](screenshots/http-xray.png?raw=true "HTTP tracing")
![Alt text](screenshots/postman/ES-sync-xray.png?raw=true "Tracing when syncing DynamoDB with ElasticSearch")

## Future work
- As mentioned before, have different type of users and protect endpoints according to that.
- Improve the frontend