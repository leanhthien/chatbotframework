import React, { Component } from 'react';
import {
  Form,
  FormGroup,
  Label,
  InputGroup,
  Input,
  Button,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Fade,
  Collapse
} from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert'
import cookie from 'react-cookies';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { getDefaultKeyBinding, EditorState, Modifier, convertToRaw } from 'draft-js'
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import './Question.css'


class Course extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.courseId = this.props.match.params.id;
    this.exerciseId = this.props.match.params.exerciseId;
    this.state = {
      selectedSolutionFile: null,
      selectedTestcaseFile: null,
      selectedSourcecodeFile: null,
      numSubmission: 5,
      description: '',
      collapse: true,
      fadeIn: true,
      name: '',
      keywords: '',
      editorState: EditorState.createEmpty(),
    };
  }

  async componentDidMount() {
    try {
      let authen = await this.checkPermission();
      this.setState({ role: authen.role });
    }
    catch (error) {
      console.log(error)
    }

  }

  async checkPermission() {
    try {
      let response = await axios.get(this.apiBaseUrl + 'token', { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.auth !== true) {
        await cookie.remove('user_token')
        return this.props.history.push("/login");
      }
      else {
        return response.data.decoded;
      }
    }
    catch (error) {
      console.log(error);
      return this.props.history.push("/login");
    }
  }

  async handleSubmitClick(event) {
    try {
      const data = new FormData()
      let { selectedSolutionFile, selectedTestcaseFile, selectedSourcecodeFile, description, name } = this.state
      if (!selectedSolutionFile || !selectedSourcecodeFile || !selectedTestcaseFile || !description || !name) {
        return Swal('Warning', 'Please type description and choose file', 'warning')
      }
      data.append('name', this.state.name)
      data.append('keywords', this.state.keywords)
      data.append('num_submit', this.state.numSubmission)
      data.append('solution', this.state.selectedSolutionFile, this.state.selectedSolutionFile.name);
      data.append('testcase', this.state.selectedTestcaseFile, this.state.selectedTestcaseFile.name);
      data.append('sourcecode', this.state.selectedSourcecodeFile, this.state.selectedSourcecodeFile.name);
      data.append('description', this.state.description);
      data.append('is_review', 1)
      let response = await axios.post(this.apiBaseUrl + `courses/${this.courseId}/exercises/${this.exerciseId}/questions`, data, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return this.props.history.push( `/courses/${this.courseId}/exercises/${this.exerciseId}/questions`, )
      }
      return NotificationManager.error("Something went wrong", 'Error!', 5000);
    }
    catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.code !== 200) {
        return NotificationManager.error(error.response.data.msg, 'Error!', 5000);
      }
      return NotificationManager.error("Something went wrong", 'Error!', 5000);
    }
  }

  async handleReview(event) {
    try {
      const data = new FormData()
      let { selectedSolutionFile, selectedTestcaseFile, selectedSourcecodeFile, description, name } = this.state
      if (!selectedSolutionFile || !selectedSourcecodeFile || !selectedTestcaseFile || !description || !name) {
        return Swal('Warning', 'Please type description and choose file', 'warning')
      }
      data.append('name', this.state.name)
      data.append('keywords', this.state.keywords)
      data.append('num_submit', this.state.numSubmission)
      data.append('solution', this.state.selectedSolutionFile, this.state.selectedSolutionFile.name);
      data.append('testcase', this.state.selectedTestcaseFile, this.state.selectedTestcaseFile.name);
      data.append('sourcecode', this.state.selectedSourcecodeFile, this.state.selectedSourcecodeFile.name);
      data.append('description', this.state.description);
      let response = await axios.post(this.apiBaseUrl + `courses/${this.courseId}/exercises/${this.exerciseId}/questions`, data, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return this.props.history.push( `/courses/${this.courseId}/exercises/${this.exerciseId}/questions/${response.data.data.id}/review`, )
      }
      return NotificationManager.error("Something went wrong", 'Error!', 5000);
    }
    catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.code !== 200) {
        return NotificationManager.error(error.response.data.msg, 'Error!', 5000);
      }
      return NotificationManager.error("Something went wrong", 'Error!', 5000);
    }
  }

 
  handleSelectedSolutionFile = event => {
    this.setState({
      selectedSolutionFile: event.target.files[0]
    })
  }

  handleSelectedTestcaseFile = event => {
    this.setState({
      selectedTestcaseFile: event.target.files[0]
    })
  }

  handleSelectedSourcecodeFile = event => {
    this.setState({
      selectedSourcecodeFile: event.target.files[0]
    })
  }

  handleDescription = value => {
    const rawContentState = convertToRaw(value.getCurrentContent());
    const markup = draftToHtml(
      rawContentState,
      {
        trigger: '#',
        separator: ' ',
      },
      true
    );
    this.setState({
      editorState: value,
      description: markup
    })
  }

  handleKeyBindings = e => {
    const tabCharacter = "      ";
    if (e.keyCode === 9) {
      e.preventDefault();
      let currentState = this.state.editorState;
      let newContentState = Modifier.replaceText(
        currentState.getCurrentContent(),
        currentState.getSelection(),
        tabCharacter
      )
      this.handleDescription(EditorState.push(currentState, newContentState, 'insert-characters'))
      return
    }
    return getDefaultKeyBinding(e)
  }

  handleName = event => {
    this.setState({
      name: event.target.value
    })
  }
  handleKeywords = event => {
    this.setState({
      keywords: event.target.value
    })
  }

  handleNumerSubmission = event => {
    if (isNaN(event.target.value)) return;
    this.setState({
      numSubmission: event.target.value
    })
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12">
            <Fade timeout={this.state.timeout} in={this.state.fadeIn}>
              <Card>
                <CardHeader>
                  <i className="fa fa-edit"></i>Create question
                    <div className="card-header-actions">
                    <Button color="link" className="card-header-action btn-setting"><i className="icon-settings"></i></Button>
                    <Button color="link" className="card-header-action btn-minimize" data-target="#collapseExample" onClick={this.toggle}><i className="icon-arrow-up"></i></Button>
                    <Button color="link" className="card-header-action btn-close" onClick={this.toggleFade}><i className="icon-close"></i></Button>
                  </div>
                </CardHeader>
                <Collapse isOpen={this.state.collapse} id="collapseExample">
                  <CardBody>
                    <Form className="form-horizontal">
                      <FormGroup>
                        <Label htmlFor="appendedInput">Name</Label>
                        <div className="controls">
                          <InputGroup>
                            <Input id="appendedInput" size="16" type="input" placeholder='Name' onChange={this.handleName} />
                          </InputGroup>
                        </div>
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="appendedInput">Keywords</Label>
                        <div className="controls">
                          <InputGroup>
                            <Input id="appendedInput" size="16" type="input" placeholder='Keywords' onChange={this.handleKeywords} />
                          </InputGroup>
                        </div>
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="appendedInput">Description</Label>
                        <div className="RichEditor-root">
                          <div className="RichEditor-root-scroll">
                            <div className=' RichEditor-editor'>
                              <Editor
                                editorState={this.state.editorState}
                                toolbarClassName="toolbarClassName"
                                wrapperClassName="wrapperClassName"
                                editorClassName="editorClassName"
                                onEditorStateChange={this.handleDescription}
                                onTab={this.handleKeyBindings}
                              />
                            </div>
                          </div>
                        </div>
                      </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="appendedInput">Number of submissions</Label>
                        </Col>
                        <Col md="2">
                          <Input id="appendedInput" min={1} value={this.state.numSubmission} size="16" type="number" placeholder='' onChange={this.handleNumerSubmission} />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="file-input">source code file (only one cpp file contain #TODO)</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Input type="file" id="sourcecode" name="sourcecode" onChange={this.handleSelectedSourcecodeFile} />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="file-input">testcase file (zip file contains text file)</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Input type="file" id="testcase" name="testcase" onChange={this.handleSelectedTestcaseFile} />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="file-multiple-input">solution file (only one cpp file)</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Input type="file" id="solution" name="solution" onChange={this.handleSelectedSolutionFile} />
                        </Col>
                      </FormGroup>
                      <div className="form-actions">
                        <Button size="sm" color="primary" onClick={(event) => this.handleSubmitClick(event)}>Publish</Button>
                        <Button size="sm" color="primary" onClick={(event) => this.handleReview(event)}>Preview</Button>
                        <Button size="sm" color="secondary" onClick={(event) => this.props.history.push(`/courses/${this.courseId}/exercises/${this.exerciseId}/questions`)}>Cancel</Button>
                      </div>
                    </Form>
                  </CardBody>
                </Collapse>
              </Card>
            </Fade>
          </Col>
        </Row>
        <NotificationContainer />
      </div>
    );
  }
}

export default Course;
