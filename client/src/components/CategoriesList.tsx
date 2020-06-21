import * as React from 'react'
import { Category } from '../types/Category'
import { CategoryItem } from './CategoryItem'
import { getCategories } from '../api/categories-api'
import { Card, Button, Divider } from 'semantic-ui-react'
import { History } from 'history'
import Auth from '../auth/Auth'

interface CategoriesListProps {
  auth: Auth
  history: History
}

interface CategoriesListState {
  categories: Category[]
}

export class CategoriesList extends React.PureComponent<CategoriesListProps, CategoriesListState> {
  state: CategoriesListState = {
    categories: []
  }

  handleCreateCategory = () => {
    this.props.history.push(`/categories/create`)
  }

  async componentDidMount() {
    try {
      const categories = await getCategories(this.props.auth.getIdToken())
      this.setState({
        categories
      })
    } catch (e) {
      alert(`Failed to fetch categories: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <h1>Categories</h1>

        <Button
          primary
          size="huge"
          className="add-button"
          onClick={this.handleCreateCategory}
        >
          Create new category
        </Button>

        <Divider clearing />

        <Card.Group>
          {this.state.categories.map(category => {
            return <CategoryItem key={category.id} category={category} />
          })}
        </Card.Group>
      </div>
    )
  }
}
