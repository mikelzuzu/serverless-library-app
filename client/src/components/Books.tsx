import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createBook, deleteBook, getBooks, patchBook } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface BooksProps {
  auth: Auth
  history: History
}

interface BooksState {
  books: Book[]
  newBookISBN: string
  newBookTitle: string
  newBookAuthor: string
  newBookPublishedDate: string
  newBookCategoryId: string
  loadingBooks: boolean
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    newBookISBN: '',
    newBookTitle: '',
    newBookAuthor: '',
    newBookPublishedDate: '',
    newBookCategoryId: '',
    loadingBooks: true
  }

  handleISBNChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookISBN: event.target.value })
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookTitle: event.target.value })
  }

  handleAuthorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookAuthor: event.target.value })
  }

  handlePublishedDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookPublishedDate: event.target.value })
  }

  handleCategoryIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookCategoryId: event.target.value })
  }

  onEditButtonClick = (isbn: string) => {
    this.props.history.push(`/books/${isbn}/edit`)
  }

  onBookCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newBook = await createBook(this.props.auth.getIdToken(), {
        isbn: this.state.newBookISBN,
        title: this.state.newBookTitle,
        author: this.state.newBookAuthor,
        publishedDate: this.state.newBookPublishedDate,
        categoryId: this.state.newBookCategoryId
      })
      this.setState({
        books: [...this.state.books, newBook],
        newBookISBN: '',
        newBookTitle: '',
        newBookAuthor: '',
        newBookPublishedDate: '',
        newBookCategoryId: ''
      })
    } catch {
      alert('Book creation failed. Make sure all the fields are filled correctly')
    }
  }

  onBookDelete = async (isbn: string) => {
    try {
      await deleteBook(this.props.auth.getIdToken(), isbn)
      this.setState({
        books: this.state.books.filter(book => book.isbn != isbn)
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  onBookCheck = async (pos: number) => {
    try {
      const book = this.state.books[pos]
      await patchBook(this.props.auth.getIdToken(), book.isbn, {
        borrowed: !book.borrowed
      })
      this.setState({
        books: update(this.state.books, {
          [pos]: { borrowed: { $set: !book.borrowed } }
        })
      })
    } catch {
      alert('Book update failed')
    }
  }

  async componentDidMount() {
    try {
      const books = await getBooks(this.props.auth.getIdToken())
      this.setState({
        books,
        loadingBooks: false
      })
    } catch (e) {
      alert(`Failed to fetch books: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">BOOKs</Header>

        {this.renderCreateBookInput()}

        {this.renderBooks()}
      </div>
    )
  }

  renderCreateBookInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            fluid
            actionPosition="left"
            placeholder="Introduce the ISBN"
            onChange={this.handleISBNChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Input
            fluid
            actionPosition="left"
            placeholder="Title"
            onChange={this.handleTitleChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Input
            fluid
            actionPosition="left"
            placeholder="Author"
            onChange={this.handleAuthorChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Input
            fluid
            actionPosition="left"
            placeholder="Introduce the published date in this format YYYY-MM-DD"
            onChange={this.handlePublishedDateChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Input
            fluid
            placeholder="CategoryId"
            onChange={this.handleCategoryIdChange}
            action={{
              color: 'teal',
              labelPosition: 'middle',
              icon: 'add',
              content: 'New book',
              onClick: this.onBookCreate
            }}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBooks() {
    if (this.state.loadingBooks) {
      return this.renderLoading()
    }

    return this.renderBooksList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading BOOKs
        </Loader>
      </Grid.Row>
    )
  }

  renderBooksList() {
    return (
      <Grid padded>
        {this.state.books.map((book, pos) => {
          return (
            <Grid.Row key={book.isbn}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onBookCheck(pos)}
                  checked={book.borrowed}
                />
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {book.title}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {book.author}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {book.publishedDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(book.isbn)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBookDelete(book.isbn)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {book.attachmentUrl && (
                <Image src={book.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
