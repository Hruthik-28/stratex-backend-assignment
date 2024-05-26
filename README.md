## Table of Contents
- [Important Links](#important-links)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Seller Routes](#seller-routes)
  - [registerSeller](#registerseller)
  - [loginSeller](#loginseller)
  - [addBooks](#addbooks)
  - [getAllBooks](#getallbooks)
  - [editBook](#editbook)
  - [deleteBook](#deletebook)
  - [deleteAllBooks](#deleteallbooks)
- [User Routes](#user-routes)
  - [registerUser](#registeruser)
  - [loginUser](#loginuser)
  - [getAllBooks](#getallbooks-1)
  - [getABook](#getabook)

## Important Links
| Content                                  | Link |
| -----------                              | ----------- |
| Postman Collection / Documentation      | [Link](https://documenter.getpostman.com/view/28570926/2sA3QqhDJB)       |

## Prerequisites
In order to successfully complete this guide, you need:

- [Node.js](https://nodejs.org/en) installed on your machine 
- A [PostgreSQL](https://www.postgresql.org/) database server running

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your_username/stratex-assignment.git
```
### 2. Navigate to the Project Directory
```bash
cd stratex-assignment
```
### 3. Install Dependencies
```bash
npm install
```
### 4. Set Up Environment Variables
- Create a `.env` file in the root directory of the project.
- Copy the contents from .env.sample and paste them into the .env file.
- Fill in the required environment variables in the .env file.
### 5. Set Up Prisma
- ### Initialize Prisma in your project:
    ```bash
    npx prisma init
    ```
### 6. Run Database Migrations
```bash
npx prisma migrate dev --name init
```
### 7. Run the apllication
```bash
# For production
npm start

# For development with hot-reloading using nodemon
npm run dev
```

# SELLER ROUTES
### `registerSeller`

Registers a new seller in the system.

**Route:** POST `/api/v1/seller/register`

**Request Body:**
- `name` (string): Name of the seller.
- `email` (string): Email of the seller.
- `password` (string): Password for the seller account.

**Responses:**
- 201: Seller registered successfully.
- 400: All fields are required.
- 400: Email is already registered.
- 500: Seller registration failed. Please try again.

**Example Request**
```json
  {
    "name": "deepthi",
    "email": "deepthi@gmail.com",
    "password": "hruthik1234"
  }
```

**Example Response**
```json
  {
    "statusCode": 201,
    "data": {},
    "message": "User registered successfully",
    "success": true
  }
```

---

### `loginSeller`

Logs in an existing seller.

**Route:** POST `/api/v1/seller/login`

**Request Body:**
- `email` (string): Email of the seller.
- `password` (string): Password for the seller account.

**Responses:**
- 200: Seller logged in successfully.
- 400: Email and password both are required.
- 400: Email is not registered as Seller.
- 401: Invalid credentials.

**Example Request**
```json
  {
    "email": "deepthi@gmail.com",
    "password": "hruthik1234"
  }
```

**Example Response**
```json
{
    "statusCode": 200,
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibmFtZSI6ImRlZXB0aGkiLCJlbWFpbCI6ImRlZXB0aGlAZ21haWwuY29tIiwidHlwZSI6InNlbGxlciIsImlhdCI6MTcxNjcxMzY3MywiZXhwIjoxNzE2ODAwMDczfQ.mRy8iiPV3OcBYX2bPW2yScuWfNo0hswrduZuPB_Ff0Y",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTcxNjcxMzY3MywiZXhwIjoxNzE3NTc3NjczfQ.7iumOkzwD6dOMylPVPxGPaEJh7bsV_9SNaaW3Yvwdt0"
    },
    "message": "Seller loggedIn Successfully",
    "success": true
}
```
---

### `addBooks`

This endpoint is used to upload books for sale by the seller.

**Route:** POST `/api/v1/seller/books`

**Request Body**

- form-data
    - `file` (file): The CSV file containing the details of the book to be uploaded.

**Responses:**
- 200: Books added successfully.
- 400: CSV file Path is required.
- 400: File is empty, no books added.
- 500: Failed to parse the CSV file.
- 500: Failed to add books record.

**Example Request**
```
Content-Type: multipart/form-data
file: [file]
 ```

**Example Response**
```json
{
    "statusCode": 200,
    "data": {},
    "message": "10 Books added successfully",
    "success": true
}
```
---

### `getAllBooks`

This endpoint retrieves a list of books available from the seller.

**Route:** GET `/api/v1/books`

#### Request
- No request body is required for this request.

**Responses:**
- 200: All Books fetched successfully.
- 404: No Books found.

**Example Response**
```json
{
    "statusCode": 200,
    "data": [
        {
            "id": 31,
            "title": "The Great Gatsby",
            "author": "F. Scott Fitzgerald",
            "publishedDate": "1925-04-10T00:00:00.000Z",
            "price": 10.99,
            "sellerId": 2,
            "createdAt": "2024-05-26T08:54:58.446Z",
            "updatedAt": "2024-05-26T08:54:58.446Z"
        },
        {
            "id": 32,
            "title": "1984",
            "author": "George Orwell",
            "publishedDate": "1949-06-08T00:00:00.000Z",
            "price": 8.99,
            "sellerId": 2,
            "createdAt": "2024-05-26T08:54:58.446Z",
            "updatedAt": "2024-05-26T08:54:58.446Z"
        }
    ]
    "message": "All Books fetched Successfully",
    "success": true
}
```
---

### `editBook`

Edits an existing book in the system.

**Route:** PATCH `/api/v1/seller/books`

**Request Body:**
- `bookId` (string): ID of the book to be edited.
- `title` (string): New title for the book.
- `price` (number): New price for the book.
- `author` (string): New author for the book.

**Responses:**
- 200: Book edited successfully.
- 400: BookId, title, price, and author are required.
- 404: No book found with given bookId.
- 400: Unauthorized request. Only Book owner i.e their seller can edit books.
- 500: Failed to edit book.

**Example Request**
```json
{
    "bookId": 30,
    "title": "Crime and Death",
    "author": "Fyodor Dostoevsky",
    "price": 25
}
 ```

**Example Response**
```json
{
    "statusCode": 200,
    "data": {
        "id": 31,
        "price": 25,
        "author": "Fyodor Dostoevsky",
        "sellerId": 2
    },
    "message": "Book edited Successfully",
    "success": true
}
```
---

### `deleteBook`

Deletes an existing book from the Seller.

**Route:** DELETE `/api/v1/seller/book/bookId`

**Request Parameters:**
- `bookId` (string): ID of the book to be deleted.

**Responses:**
- 200: Book deleted successfully.
- 400: BookId is required.
- 404: No book found with given bookId.
- 400: Unauthorized request. Only Book owner i.e their seller can delete books.

**Example Response**
```json
{
    "statusCode": 200,
    "data": {},
    "message": "Book Deleted Successfully",
    "success": true
}
```
---

### `deleteAllBooks`

Deletes all books belonging to the logged-in seller.

**Route:** DELETE `/api/v1/seller/books`

**Responses:**
- 200: All Books deleted successfully.

**Example Response**
```json
{
    "statusCode": 200,
    "data": {},
    "message": "All Books Deleted Successfully",
    "success": true
}
```
---

# USER ROUTES
### `registerUser`

Registers a new user.

**Route:** POST `/api/v1/user/register`

**Request Body:**
- `name` (string): Name of the user.
- `email` (string): Email of the user.
- `password` (string): Password for the user account.

**Responses:**
- 201: User registered successfully.
- 400: All fields are required.
- 400: Email is already registered.
- 500: User registration failed. Please try again.

**Example Request**
```json
{
    "name": "hruthik",
    "email": "hruthik@gmail.com",
    "password": "hruthik123"
}
```

**Example Response**
```json
{
    "statusCode": 201,
    "data": {},
    "message": "User registered successfully",
    "success": true
}
```
---

### `loginUser`

Logs in an existing user.

**Route:** POST `/api/v1/user/login`

**Request Body:**
- `email` (string): Email of the user.
- `password` (string): Password for the user account.

**Responses:**
- 200: User logged in successfully.
- 400: Email and password both are required.
- 400: Email is not registered.
- 401: Invalid credentials.

**Example Request**
```json
{
    "email": "hruthik@gmail.com",
    "password": "hruthik123"
}
```

**Example Response**
```json
{
    "statusCode": 200,
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwibmFtZSI6ImhydXRoaWsiLCJlbWFpbCI6ImhydXRoaWtAZ21haWwuY29tIiwidHlwZSI6InVzZXIiLCJpYXQiOjE3MTY3MTM4MjgsImV4cCI6MTcxNjgwMDIyOH0.69ZSqRine_i6n2y3YwbpyjwjcKFIaolojsiw4KScaRE",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTcxNjcxMzgyOCwiZXhwIjoxNzE3NTc3ODI4fQ.Fl8PtuIrozfKBFyBzRF59o_zdoRyRK9jt1CQmKUeEpA"
    },
    "message": "User loggedIn Successfully",
    "success": true
}
```
---

### `getAllBooks`

Retrieves all books from the system.

**Route:** GET `/api/v1/user/getAllBooks`

**Responses:**
- 200: All Books fetched successfully.
- 404: No Books Found.

**Example Response**
```json
{
    "statusCode": 200,
    "data": [
        {
            "id": 41,
            "title": "The Great Gatsby",
            "author": "F. Scott Fitzgerald",
            "publishedDate": "1925-04-10T00:00:00.000Z",
            "price": 10.99,
            "sellerId": 2,
            "createdAt": "2024-05-26T08:57:35.532Z",
            "updatedAt": "2024-05-26T08:57:35.532Z"
        },
        {
            "id": 42,
            "title": "1984",
            "author": "George Orwell",
            "publishedDate": "1949-06-08T00:00:00.000Z",
            "price": 8.99,
            "sellerId": 2,
            "createdAt": "2024-05-26T08:57:35.532Z",
            "updatedAt": "2024-05-26T08:57:35.532Z"
        }
    ]
    "message": "All Books Fetched Successfully",
    "success": true
}
```
---

### `getABook`

Retrieves a specific book from the system.

**Route:** GET `/api/v1/getABook/bookId`

**Request Parameters:**
- `bookId` (number): ID of the book to retrieve.

**Responses:**
- 200: Book fetched successfully.
- 400: Invalid Book Id.

**Example Response**
```json
{
    "statusCode": 200,
    "data": {
        "id": 45,
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "publishedDate": "1951-07-16T00:00:00.000Z",
        "price": 9.99,
        "sellerId": 2,
        "createdAt": "2024-05-26T08:57:35.532Z",
        "updatedAt": "2024-05-26T08:57:35.532Z"
    },
    "message": "All Books Fetched Successfully",
    "success": true
}
```
---
