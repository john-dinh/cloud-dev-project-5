import * as React from 'react'
import moment from 'moment'
import Auth from '../auth/Auth'
import { Button, Divider, Grid, Image } from 'semantic-ui-react'
import SemanticDatepicker from 'react-semantic-ui-datepickers';

import { getBooksForPublish } from '../api/books-api'
import { Book } from '../types/Book'

interface LogInProps {
  auth: Auth
}

interface LogInState {
  books: any
  
}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  state: LogInState = {
    books: [],
  }
  onLogin = () => {
    this.props.auth.login()
  }
  onChangeDate=async(event: any, data: { value: any; })=>{
    let createdAt="null"
    if(moment(data.value).isValid()){
      createdAt = moment(data.value).format("YYYY-MM-DD")
    }
    const books = await getBooksForPublish(createdAt)
      this.setState({
        books,
      })

  }

  async componentDidMount() {
    try {
      const books = await getBooksForPublish('null')
      this.setState({
        books,
      })
    } catch (e) {
      console.log(`Failed to fetch books`, e)
    }
  }
  renderBooksList() {
    return (
      <Grid padded>
        <Grid.Row key={1}>
               <Grid.Column width={6} verticalAlign="middle">
                 <b>Title</b>
               </Grid.Column>
               <Grid.Column width={7} verticalAlign="middle">
                 <b>Description</b>
               </Grid.Column>
               <Grid.Column width={3} floated="right">
               <b>Created At</b>
               </Grid.Column>
               <Grid.Column width={16}>
                 <Divider />
               </Grid.Column>
        </Grid.Row>

        {this.state.books.map((book: Book, pos: any) => {
          return (
            <Grid.Row key={book.bookId}>
               
              <Grid.Column width={6} verticalAlign="middle">
                {book.name}
              </Grid.Column>
              <Grid.Column width={7} verticalAlign="middle">
                {book.description}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {moment(book.createdAt).format("YYYY-MM-DD HH:mm")}
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
  render() {
    return (
      <div>
        <h1>Please log in</h1>

        <Button onClick={this.onLogin} size="huge" color="olive">
          Log in
        </Button>
        <h1>Books Publish</h1>
        <SemanticDatepicker onChange={this.onChangeDate} />
        {this.renderBooksList()}
      </div>
    )
  }
}
