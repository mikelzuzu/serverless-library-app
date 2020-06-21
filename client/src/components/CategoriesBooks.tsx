import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Checkbox,
  Divider,
  Grid,
  Header,
  Button,
  Image,
  Loader
} from 'semantic-ui-react'

import { getCategoriesBooks,patchBook } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface CategoriesBooksProps {
  auth: Auth
  history: History
  match: {
    params: {
      categoryId: string
    }
  }
}

interface CategoriesBooksState {
  books: Book[]
  loadingBooks: boolean
}

export class CategoriesBooks extends React.PureComponent<CategoriesBooksProps, CategoriesBooksState> {
  state: CategoriesBooksState = {
    books: [],
    loadingBooks: true
  }

  handleBorrowedBooks = () => {
    this.props.history.push(`/categories/${this.props.match.params.categoryId}/borrowed`)
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
      const books = await getCategoriesBooks(this.props.auth.getIdToken(), this.props.match.params.categoryId)
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

        <Button
          primary
          size="huge"
          className="search-button"
          onClick={this.handleBorrowedBooks}
        >
          Check borrowed books
        </Button>

        {this.renderBooks()}
      </div>
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
