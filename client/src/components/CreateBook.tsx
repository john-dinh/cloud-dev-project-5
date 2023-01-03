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
  addBookModal: boolean,
  openEditModal: boolean,
  indexBook: number
}

export class CreateBook extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    book: {
      bookId: '',
      createdAt: '',
      name: '',
      description: ''
    },
    newBook: { name: '', description: '' },
    addBookModal: false,
    openEditModal: false,
    loadingBooks: true,
    indexBook: -1
  }

  handleTitleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const book = {...this.state.book, name: event.target.value };
    this.setState({ book })
  }

  handleDescriptionEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const book = {...this.state.book, description: event.target.value };
    this.setState({ book })
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBook = {...this.state.newBook, name: event.target.value };
    this.setState({ newBook })
  }
  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBook = {...this.state.newBook, description: event.target.value };
    this.setState({ newBook })
  }

  setOpen = (openAddModal: boolean) => {
    this.setState({addBookModal: openAddModal, newBook: { name: '', description: '' }})
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
        createdAt
      })
      this.setState({
        books: [...this.state.books, newBook],
        addBookModal: false
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

  onBookUpdate = async (pos: number) => {
    try {
      const book = this.state.book
      await patchBook(this.props.auth.getIdToken(), book.bookId, {
        name: book.name,
        createdAt: book.createdAt,
        description: book.description
      })
      this.setState({
        books: update(this.state.books, {
          [pos]: { name: { $set: book.name }, description: { $set: book.description } }
        }),
        book: {name: '', description: '', createdAt: '', bookId: ""},
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
        <Header as="h1">Book managements</Header>

        {this.renderCreateBook()}

        {this.renderEditBook()}

        {this.renderCreateBookInput()}

        {this.renderBookList()}
      </div>
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
            content="Add Book"
            positive
            onClick={()=>this.setOpen(true)}
          />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderCreateBook() {
    return (
      <Modal
            onClose={() => this.setOpen(false)}
            onOpen={() => this.setOpen(true)}
            open={this.state.addBookModal}
          >
            <Modal.Header>Add new Book</Modal.Header>
            <Modal.Content>
            <Form>
              <Form.Field required>
                <label>Book Title</label>
                <Input placeholder='Book Title' onChange={this.handleTitleChange} />
              </Form.Field>
              <Form.Field>
                <label>Description</label>
                <Input placeholder='Description' onChange={this.handleDescriptionChange}/>
              </Form.Field>
            </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button color='green' onClick={() => this.setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={()=>this.onBookCreate()}
                content="Add Book"
                labelPosition='right'
                icon='add'
                positive
                disabled={this.state.newBook.name =='' || this.state.newBook.name.length < 3}
              />
            </Modal.Actions>
       </Modal>
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
          Loading Books
        </Loader>
      </Grid.Row>
    )
  }

  renderEditBook() {
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
              <label>Book Title</label>
              <Input placeholder='Book Title' onChange={this.handleTitleEditChange} value={this.state.book.name}/>
            </Form.Field>
            <Form.Field>
              <label>Description</label>
              <Input placeholder='Description' onChange={this.handleDescriptionEditChange} value={this.state.book.description}/>
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='brown' onClick={() => this.setEdit(false, -1)}>
            Cancel
          </Button>
          <Button
            icon='save'
            content="Update"
            labelPosition='right'
            onClick={()=>this.onBookUpdate(this.state.indexBook)}
            positive
          />
        </Modal.Actions>
      </Modal>
    )
  }

  renderBooksList() {
    return (
      <Grid padded>
        <Grid.Row key={1}>
          <Grid.Column width={1} verticalAlign="middle">
            <b>No</b>
          </Grid.Column>
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
            <b>Delete</b>
           </Grid.Column>
           <Grid.Column width={16}>
             <Divider />
           </Grid.Column>
        </Grid.Row>

        {this.state.books.map((book, pos) => {
          return (
            <Grid.Row key={book.bookId}>
              <Grid.Column width={1} verticalAlign="middle">
                {pos}
              </Grid.Column>
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
                  color="orange"
                  onClick={()=>this.setEdit(true, pos)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="green"
                  onClick={() => this.onEditButtonClick(book.bookId)}
                >
                  <Icon name="upload" />
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
