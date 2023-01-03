import * as React from 'react'
import moment from 'moment'
import Auth from '../auth/Auth'
import { Button, Divider, Grid, Image } from 'semantic-ui-react'
import SemanticDatepicker from 'react-semantic-ui-datepickers';

import { getArticlesForPublish } from '../api/articles-api'
import { Article } from '../types/Article'

interface LogInProps {
  auth: Auth
}

interface LogInState {
  articles: any
  
}

export class LogIn extends React.PureComponent<LogInProps, LogInState> {
  state: LogInState = {
    articles: [],
  }
  onLogin = () => {
    this.props.auth.login()
  }
  onChangeDate=async(event: any, data: { value: any; })=>{
    let createdAt="null"
    if(moment(data.value).isValid()){
      createdAt = moment(data.value).format("YYYY-MM-DD")
    }
    const articles = await getArticlesForPublish(createdAt)
      this.setState({
        articles,
      })

  }

  async componentDidMount() {
    try {
      const articles = await getArticlesForPublish('null')
      this.setState({
        articles,
      })
    } catch (e) {
      console.log(`Failed to fetch articles`, e)
    }
  }
  renderArticlesList() {
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

        {this.state.articles.map((article: Article, pos: any) => {
          return (
            <Grid.Row key={article.articleId}>
               
              <Grid.Column width={6} verticalAlign="middle">
                {article.name}
              </Grid.Column>
              <Grid.Column width={7} verticalAlign="middle">
                {article.description}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {moment(article.createdAt).format("YYYY-MM-DD HH:mm")}
              </Grid.Column>
             
              {article.attachmentUrl && (
                <Image src={article.attachmentUrl} size="small" wrapped />
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
        <h1>Articles Publish</h1>
        <SemanticDatepicker onChange={this.onChangeDate} />
        {this.renderArticlesList()}
      </div>
    )
  }
}
