import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import { createCategory } from '../api/categories-api'
import Auth from '../auth/Auth'

interface CreateCategoryProps {
  auth: Auth
}

interface CreateCategoryState {
  name: string
  description: string
  uploadingCategory: boolean
}

export class CreateCategory extends React.PureComponent<
  CreateCategoryProps,
  CreateCategoryState
> {
  state: CreateCategoryState = {
    name: '',
    description: '',
    uploadingCategory: false
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ description: event.target.value })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.name || !this.state.description) {
        alert('Name and description should be provided')
        return
      }

      this.setUploadState(true)
      const category = await createCategory(this.props.auth.getIdToken(), {
        name: this.state.name,
        description: this.state.description
      })

      console.log('Created description', category)

      alert('Category was created!')
    } catch (e) {
      alert('Could not upload an image: ' + e.message)
    } finally {
      this.setUploadState(false)
    }
  }

  setUploadState(uploadingCategory: boolean) {
    this.setState({
      uploadingCategory
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new category</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <input
              placeholder="Category name"
              value={this.state.name}
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <input
              placeholder="Category description"
              value={this.state.description}
              onChange={this.handleDescriptionChange}
            />
          </Form.Field>
          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {
    return (
      <Button loading={this.state.uploadingCategory} type="submit">
        Create
      </Button>
    )
  }
}
