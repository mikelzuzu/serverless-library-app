import * as React from 'react'
import { Card } from 'semantic-ui-react'
import { Category } from '../types/Category'
import { Link } from 'react-router-dom'

interface CategoryCardProps {
  category: Category
}

interface CategoryCardState {
}

export class CategoryItem extends React.PureComponent<CategoryCardProps, CategoryCardState> {

  render() {
    return (
      <Card>
        <Card.Content>
          <Card.Header>
            <Link to={`/categories/${this.props.category.id}`}>{this.props.category.name}</Link>
          </Card.Header>
          <Card.Description>{this.props.category.description}</Card.Description>
        </Card.Content>
      </Card>
    )
  }
}
