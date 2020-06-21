import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { EditBook } from './components/EditBook'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Books } from './components/Books'
import { CategoriesList } from './components/CategoriesList'
import { CreateCategory } from './components/CreateCategory'
import { CategoriesBooks } from './components/CategoriesBooks'
import { CategoriesBooksBorrowed } from './components/CategoriesBooksBorrowed'
import { SearchBooks } from './components/SearchBooks'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item name="All Books">
          <Link to="/admin/books">All Books</Link>
        </Menu.Item>
        <Menu.Item name="Search Books">
          <Link to="/search">Search Books</Link>
        </Menu.Item>

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/admin/books"
          exact
          render={props => {
            return <Books {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/search"
          exact
          render={props => {
            return <SearchBooks {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/categories/create"
          exact
          render={props => {
            return <CreateCategory {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/categories/:categoryId"
          exact
          render={props => {
            return <CategoriesBooks {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/categories/:categoryId/borrowed"
          exact
          render={props => {
            return <CategoriesBooksBorrowed {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/books/:isbn/edit"
          exact
          render={props => {
            return <EditBook {...props} auth={this.props.auth} />
          }}
        />

        <Route 
          path="/" 
          exact
          render={props => {
            return <CategoriesList {...props} auth={this.props.auth} />
          }}
          // component={CategoriesList} 
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
