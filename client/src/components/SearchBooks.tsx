import { History } from 'history'
import * as React from 'react'
import {
  Divider,
  Grid,
  Header,
  Input,
  Loader
} from 'semantic-ui-react'

import { searchBooks } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface SearchBooksProps {
  auth: Auth
  history: History
}

interface SearchBooksState {
  books: Book[]
  query: string
  loadingBooks: boolean
}

export class SearchBooks extends React.PureComponent<SearchBooksProps, SearchBooksState> {
  state: SearchBooksState = {
    books: [],
    query: '',
    loadingBooks: false
  }

  handleQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: event.target.value })
  }

  onSearchBooks = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      //const dueDate = this.calculateDueDate()
      this.setState({
        books: [],
        loadingBooks: true
      })
      const books = await searchBooks(this.props.auth.getIdToken(), this.state.query)
      this.setState({
        books,
        loadingBooks: false
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">BOOKs</Header>

        {this.renderSearchBookInput()}

        {this.renderBooks()}
      </div>
    )
  }

  renderSearchBookInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'middle',
              icon: 'search',
              content: 'Search',
              onClick: this.onSearchBooks
            }}
            fluid
            placeholder="Enter the query"
            onChange={this.handleQuery}
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
              <Grid.Column width={3} verticalAlign="middle">
              {book.isbn}
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
