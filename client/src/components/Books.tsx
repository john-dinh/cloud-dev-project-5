import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Modal,
  Form
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
  book: Book
  newBook: { name: string, description: string },
  loadingBooks: boolean,
  openAddModal: boolean,
  openEditModal: boolean,
  indexBook: number,
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    book: {
      bookId: '',
      createdAt: '',
      name: '',
      description: '',
      publish: ''
    },
    newBook: { name: '', description: '' },
    loadingBooks: true,
    openAddModal: false,
    openEditModal: false,
    indexBook: -1,

  }
  
  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBook = {...this.state.newBook, name: event.target.value };
    this.setState({ newBook })
  }
  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBook = {...this.state.newBook, description: event.target.value };
    this.setState({ newBook })
  }

  handleTitleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const book = {...this.state.book, name: event.target.value };
    this.setState({ book })
  }

  handleDescriptionEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const book = {...this.state.book, description: event.target.value };
    this.setState({ book })
  }

  setOpen = (openAddModal: boolean) => {
    this.setState({openAddModal, newBook: { name: '', description: '' }})
  }
  setEdit = (openEditModal: boolean, pos: number) => {
    const book = this.state.books[pos]
    if (book) {
      this.setState({openEditModal, book, indexBook: pos })
      
    }
    else {
      this.setState({openEditModal})
    }
  }

  onEditButtonClick = (bookId: string) => {
    this.props.history.push(`/books/${bookId}/edit`)
  }

  onBookCreate = async () => {
    try {
      const createdAt = dateFormat(new Date(), 'yyyy-mm-dd')
      const { name, description} = this.state.newBook;
      const newBook = await createBook(this.props.auth.getIdToken(), {
        name,
        description,
        publish: '',
        createdAt
      })
      this.setState({
        books: [...this.state.books, newBook],
        openAddModal: false
      })
    } catch {
      alert('Book creation failed')
    }
  }

  onBookDelete = async (bookId: string) => {
    try {
      await deleteBook(this.props.auth.getIdToken(), bookId)
      this.setState({
        books: this.state.books.filter(book => book.bookId !== bookId)
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  onPublishBook = async (pos: number) => {
    try {
      const book = this.state.books[pos]
      await patchBook(this.props.auth.getIdToken(), book.bookId, {
        name: book.name,
        createdAt: book.createdAt,
        publish: book.publish == 'y'? 'n' : "y",
        description: book.description
      })
      this.setState({
        books: update(this.state.books, {
          [pos]: { publish: { $set: book.publish == 'y'? 'n' : "y" } }
        })
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  onBookUpdate = async (pos: number) => {
    try {
      const book = this.state.book
      await patchBook(this.props.auth.getIdToken(), book.bookId, {
        name: book.name,
        createdAt: book.createdAt,
        publish: book.publish,
        description: book.description
      })
      this.setState({
        books: update(this.state.books, {
          [pos]: { name: { $set: book.name }, description: { $set: book.description } }
        }),
        book: {name: '', description: '', createdAt: '', publish: '', bookId: ""},
        indexBook: -1,
        openEditModal: false,
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
      console.log(`Failed to fetch books`, e)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">BOOKS</Header>

        {this.renderBookModal()}
        {this.renderBookEditModal()}
        {this.renderCreateBookInput()}

        {this.renderBookList()}
      </div>
    )
  }

  renderBookModal() {
    return (
      <Modal
            onClose={() => this.setOpen(false)}
            onOpen={() => this.setOpen(true)}
            open={this.state.openAddModal}
          >
            <Modal.Header>Add new Book</Modal.Header>
            <Modal.Content>
            <Form>
              <Form.Field required>
                <label>Title</label>
                <Input placeholder='Please enter the Title' onChange={this.handleTitleChange} />
              </Form.Field>
              <Form.Field required>
                <label>Description</label>
                <Input placeholder='Please enter the Description' onChange={this.handleDescriptionChange}/>
              </Form.Field>
            </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button color='black' onClick={() => this.setOpen(false)}>
                Cancel
              </Button>
              <Button
                content="Add"
                labelPosition='right'
                icon='add'
                onClick={()=>this.onBookCreate()}
                positive
                disabled={this.state.newBook.name =='' || this.state.newBook.description == ''}
              />
            </Modal.Actions>
       </Modal>
    )
  }

  renderBookEditModal() {
    return (
      <Modal
            onClose={() => this.setEdit(false, -1)}
            onOpen={() => this.setEdit(true, -1)}
            open={this.state.openEditModal}
          >
            <Modal.Header>Edit Book</Modal.Header>
            <Modal.Content>
            <Form>
              <Form.Field required>
                <label>Title</label>
                <Input placeholder='Please enter the Title' onChange={this.handleTitleEditChange} value={this.state.book.name}/>
              </Form.Field>
              <Form.Field required>
                <label>Description</label>
                <Input placeholder='Please enter the Description' onChange={this.handleDescriptionEditChange} value={this.state.book.description}/>
              </Form.Field>
            </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button color='black' onClick={() => this.setEdit(false, -1)}>
                Cancel
              </Button>
              <Button
                content="Save"
                labelPosition='right'
                icon='save'
                onClick={()=>this.onBookUpdate(this.state.indexBook)}
                positive
              />
            </Modal.Actions>
       </Modal>
    )
  }

  renderCreateBookInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
        <Grid.Column width={16}>
            <Button
                  icon='add'
                  positive
                  onClick={()=>this.setOpen(true)}
            />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBookList() {
    if (this.state.loadingBooks) {
      return this.renderLoading()
    }

    return this.renderBooksList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading BOOKS
        </Loader>
      </Grid.Row>
    )
  }

  renderBooksList() {
    return (
      <Grid padded>
        <Grid.Row key={1}>
               <Grid.Column width={4} verticalAlign="middle">
                 <b>Title</b>
               </Grid.Column>
               <Grid.Column width={5} verticalAlign="middle">
                 <b>Description</b>
               </Grid.Column>
               <Grid.Column width={3} floated="right">
               <b>Created At</b>
               </Grid.Column>
               <Grid.Column width={1} floated="right">
               <b>Edit</b>
               </Grid.Column>
               <Grid.Column width={1} floated="right">
               <b>Upload</b>
               </Grid.Column>
               <Grid.Column width={1} floated="right">
               <b>Publish</b>
               </Grid.Column>
               <Grid.Column width={1} floated="right">
                <b>Delete</b>
               </Grid.Column>
               <Grid.Column width={16}>
                 <Divider />
               </Grid.Column>
        </Grid.Row>

        {this.state.books.map((book, pos) => {
          return (
            <Grid.Row key={book.bookId}>
               
              <Grid.Column width={4} verticalAlign="middle">
                {book.name}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {book.description}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {book.createdAt}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={()=>this.setEdit(true, pos)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(book.bookId)}
                >
                  <Icon name="upload" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color={book.publish == 'y'? "blue": "brown"}
                  onClick={() => this.onPublishBook(pos)}
                >
                  <Icon name="share" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBookDelete(book.bookId)}
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
