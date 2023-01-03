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

import { createArticle, deleteArticle, getArticles, patchArticle } from '../api/articles-api'
import Auth from '../auth/Auth'
import { Article } from '../types/Article'

interface ArticlesProps {
  auth: Auth
  history: History
}

interface ArticlesState {
  articles: Article[]
  article: Article
  newArticle: { name: string, description: string },
  loadingArticles: boolean,
  openAddModal: boolean,
  openEditModal: boolean,
  indexArticle: number,
}

export class Articles extends React.PureComponent<ArticlesProps, ArticlesState> {
  state: ArticlesState = {
    articles: [],
    article: {
      articleId: '',
      createdAt: '',
      name: '',
      description: '',
      publish: ''
    },
    newArticle: { name: '', description: '' },
    loadingArticles: true,
    openAddModal: false,
    openEditModal: false,
    indexArticle: -1,

  }
  
  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newArticle = {...this.state.newArticle, name: event.target.value };
    this.setState({ newArticle })
  }
  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newArticle = {...this.state.newArticle, description: event.target.value };
    this.setState({ newArticle })
  }

  handleTitleEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const article = {...this.state.article, name: event.target.value };
    this.setState({ article })
  }

  handleDescriptionEditChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const article = {...this.state.article, description: event.target.value };
    this.setState({ article })
  }

  setOpen = (openAddModal: boolean) => {
    this.setState({openAddModal, newArticle: { name: '', description: '' }})
  }
  setEdit = (openEditModal: boolean, pos: number) => {
    const article = this.state.articles[pos]
    if (article) {
      this.setState({openEditModal, article, indexArticle: pos })
      
    }
    else {
      this.setState({openEditModal})
    }
  }

  onEditButtonClick = (articleId: string) => {
    this.props.history.push(`/articles/${articleId}/edit`)
  }

  onArticleCreate = async () => {
    try {
      const createdAt = dateFormat(new Date(), 'yyyy-mm-dd')
      const { name, description} = this.state.newArticle;
      const newArticle = await createArticle(this.props.auth.getIdToken(), {
        name,
        description,
        publish: '',
        createdAt
      })
      this.setState({
        articles: [...this.state.articles, newArticle],
        openAddModal: false
      })
    } catch {
      alert('Article creation failed')
    }
  }

  onArticleDelete = async (articleId: string) => {
    try {
      await deleteArticle(this.props.auth.getIdToken(), articleId)
      this.setState({
        articles: this.state.articles.filter(article => article.articleId !== articleId)
      })
    } catch {
      alert('Article deletion failed')
    }
  }

  onPublishArticle = async (pos: number) => {
    try {
      const article = this.state.articles[pos]
      await patchArticle(this.props.auth.getIdToken(), article.articleId, {
        name: article.name,
        createdAt: article.createdAt,
        publish: article.publish == 'y'? 'n' : "y",
        description: article.description
      })
      this.setState({
        articles: update(this.state.articles, {
          [pos]: { publish: { $set: article.publish == 'y'? 'n' : "y" } }
        })
      })
    } catch {
      alert('Article deletion failed')
    }
  }

  onArticleUpdate = async (pos: number) => {
    try {
      const article = this.state.article
      await patchArticle(this.props.auth.getIdToken(), article.articleId, {
        name: article.name,
        createdAt: article.createdAt,
        publish: article.publish,
        description: article.description
      })
      this.setState({
        articles: update(this.state.articles, {
          [pos]: { name: { $set: article.name }, description: { $set: article.description } }
        }),
        article: {name: '', description: '', createdAt: '', publish: '', articleId: ""},
        indexArticle: -1,
        openEditModal: false,
      })
    } catch {
      alert('Article deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const articles = await getArticles(this.props.auth.getIdToken())
      this.setState({
        articles,
        loadingArticles: false
      })
    } catch (e) {
      console.log(`Failed to fetch articles`, e)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">ARTICLES</Header>

        {this.renderArticleModal()}
        {this.renderArticleEditModal()}
        {this.renderCreateArticleInput()}

        {this.renderArticles()}
      </div>
    )
  }

  renderArticleModal() {
    return (
      <Modal
            onClose={() => this.setOpen(false)}
            onOpen={() => this.setOpen(true)}
            open={this.state.openAddModal}
          >
            <Modal.Header>Add new Article</Modal.Header>
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
                onClick={()=>this.onArticleCreate()}
                positive
                disabled={this.state.newArticle.name =='' || this.state.newArticle.description == ''}
              />
            </Modal.Actions>
       </Modal>
    )
  }

  renderArticleEditModal() {
    return (
      <Modal
            onClose={() => this.setEdit(false, -1)}
            onOpen={() => this.setEdit(true, -1)}
            open={this.state.openEditModal}
          >
            <Modal.Header>Edit Article</Modal.Header>
            <Modal.Content>
            <Form>
              <Form.Field required>
                <label>Title</label>
                <Input placeholder='Please enter the Title' onChange={this.handleTitleEditChange} value={this.state.article.name}/>
              </Form.Field>
              <Form.Field required>
                <label>Description</label>
                <Input placeholder='Please enter the Description' onChange={this.handleDescriptionEditChange} value={this.state.article.description}/>
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
                onClick={()=>this.onArticleUpdate(this.state.indexArticle)}
                positive
              />
            </Modal.Actions>
       </Modal>
    )
  }

  renderCreateArticleInput() {
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

  renderArticles() {
    if (this.state.loadingArticles) {
      return this.renderLoading()
    }

    return this.renderArticlesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading ARTICLES
        </Loader>
      </Grid.Row>
    )
  }

  renderArticlesList() {
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

        {this.state.articles.map((article, pos) => {
          return (
            <Grid.Row key={article.articleId}>
               
              <Grid.Column width={4} verticalAlign="middle">
                {article.name}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {article.description}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {article.createdAt}
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
                  onClick={() => this.onEditButtonClick(article.articleId)}
                >
                  <Icon name="upload" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color={article.publish == 'y'? "blue": "brown"}
                  onClick={() => this.onPublishArticle(pos)}
                >
                  <Icon name="share" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onArticleDelete(article.articleId)}
                >
                  <Icon name="delete" />
                </Button>
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
}
