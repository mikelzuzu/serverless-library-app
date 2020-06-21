import { History } from 'history'
import * as React from 'react'
import update from 'immutability-helper'
import {
  Divider,
  Grid,
  Header,
  Input,
  Image,
  Button,
  Checkbox,
  Icon,
  Loader
} from 'semantic-ui-react'

import { getBook, deleteBook, patchBook } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface GetBookProps {
  auth: Auth
  history: History
}

interface GetBookState {
  books: Book[]
  searchIsbn: string
  loadingBooks: boolean
}

export class GetBook extends React.PureComponent<GetBookProps, GetBookState> {
  state: GetBookState = {
    books: [],
    searchIsbn: '',
    loadingBooks: false
  }

  handleISBN = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchIsbn: event.target.value })
  }

  onEditButtonClick = (isbn: string) => {
    this.props.history.push(`/books/${isbn}/edit`)
  }

  onGetBooks = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      //const dueDate = this.calculateDueDate()
      this.setState({
        books: [],
        loadingBooks: true
      })
      const book = await getBook(this.props.auth.getIdToken(), this.state.searchIsbn)
      const books = (book  instanceof Array) ? book : [book]

      this.setState({
        books,
        loadingBooks: false
      })
    } catch {
      this.setState({
        books: [],
        loadingBooks: false
      })
      alert('Get book failed')
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

  render() {
    return (
      <div>
        <Header as="h1">BOOKs</Header>

        {this.renderGetBookInput()}

        {this.renderBooks()}
      </div>
    )
  }

  renderGetBookInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'search',
              content: 'Get Book',
              onClick: this.onGetBooks
            }}
            fluid
            placeholder="Enter the ISBN"
            onChange={this.handleISBN}
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
              <Grid.Column width={2} verticalAlign="middle">
              {book.isbn}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {book.title}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
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
