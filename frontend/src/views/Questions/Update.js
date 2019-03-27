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
import cookie from 'react-cookies';
import { getDefaultKeyBinding, EditorState, Modifier, convertToRaw } from 'draft-js'
import { stateFromHTML } from 'draft-js-import-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import './Question.css'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

class Course extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.courseId = this.props.match.params.id;
    this.exerciseId = this.props.match.params.exerciseId;
    this.questionId = this.props.match.params.questionId;
    this.state = {
      collapse: true,
      fadeIn: true,
      selectedSolutionFile: null,
      selectedTestcaseFile: null,
      selectedSourcecodeFile: null,
      description: '',
      numSubmission: 0,
      isChange: false,
      name: '',
      editorState: EditorState.createEmpty()
    };
  }

  async componentDidMount() {
    try {
      let authen = await this.checkPermission();
      this.setState({ role: authen.role });
      let question = await this.getQuestion()
      let { keyword, description, solution_name, sourcecode_name, testcase_name, num_submit, name } = question || {}
      if (description && solution_name && sourcecode_name && testcase_name) {
        let contentState = stateFromHTML(description.toString() || '');
        this.setState({editorState: EditorState.createWithContent(contentState), description,
         solution: solution_name, sourcecode: sourcecode_name, testcase: testcase_name, numSubmission: num_submit, name, keywords: keyword})
      }
      
    }
    catch (error) {
      console.log(error)
      
    }
  }

  async getQuestion() {
    try {
      let response = await axios.get(this.apiBaseUrl + `courses/${this.courseId}/exercises/${this.exerciseId}/questions/${this.questionId}`, { headers: { "Authorization": `Bearer ${this.token}` } })
      if (response.data.data) {
        return response.data.data
      }
    } catch (e) {
      console.log(e)
      return null
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

  handleSelectedSolutionFile = event => {
    this.setState({
      selectedSolutionFile: event.target.files[0], isChange: true
    })
  }

  handleSelectedTestcaseFile = event => {
    this.setState({
      selectedTestcaseFile: event.target.files[0], isChange: true
    })
  }

  handleSelectedSourcecodeFile = event => {
    this.setState({
      selectedSourcecodeFile: event.target.files[0], isChange: true
    })
  }

  handleDescription = value =>{
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
      description: markup,
      isChange: true
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

  handleKeyWord = event =>{
    this.setState({
      keywords: event.target.value, isChange: true
    })
  }

  handleName = event =>{
    this.setState({
      name: event.target.value, isChange: true
    })
  }

  handleNumerSubmission = event => {
    if (isNaN(event.target.value)) return;
    this.setState({
      numSubmission: event.target.value, isChange: true
    })
  }

  async handleSubmitClick(event) {
    const data = new FormData()
    try {
      if (this.state.selectedSolutionFile) {
        data.append('solution', this.state.selectedSolutionFile, this.state.selectedSolutionFile.name);
      }
      if (this.state.selectedTestcaseFile) {
        data.append('testcase', this.state.selectedTestcaseFile, this.state.selectedTestcaseFile.name);
      }
      if (this.state.selectedSourcecodeFile) {
        data.append('sourcecode', this.state.selectedSourcecodeFile, this.state.selectedSourcecodeFile.name);
      }
      if (this.state.description) {
        data.append('description', this.state.description);
      }
      if (this.state.numSubmission) {
        data.append('num_submit', this.state.numSubmission)
      }
      if (this.state.name) {
        data.append('name', this.state.name)
      }
      if (this.state.keywords) {
        data.append('keywords', this.state.keywords)
      }
      let response = await axios.put(this.apiBaseUrl + `courses/${this.courseId}/exercises/${this.exerciseId}/questions/${this.questionId}`, data, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
          return this.props.history.push(`/courses/${this.courseId}/exercises/${this.exerciseId}/questions`)
      } else {
        return NotificationManager.error("Something went wrong", 'Error!', 5000);
      }
    } catch (error) {
      console.log(error)
      if (error.response && error.response.data && error.response.data.code !== 200) {
        return NotificationManager.error(error.response.data.msg, 'Error!', 5000);
      }
      return NotificationManager.error("Something went wrong", 'Error!', 5000);

    }

  }

  async handleReview(event) {
    const data = new FormData()
    try {
      if (this.state.selectedSolutionFile) {
        data.append('solution', this.state.selectedSolutionFile, this.state.selectedSolutionFile.name);
      }
      if (this.state.selectedTestcaseFile) {
        data.append('testcase', this.state.selectedTestcaseFile, this.state.selectedTestcaseFile.name);
      }
      if (this.state.selectedSourcecodeFile) {
        data.append('sourcecode', this.state.selectedSourcecodeFile, this.state.selectedSourcecodeFile.name);
      }
      if (this.state.description) {
        data.append('description', this.state.description);
      }
      if (this.state.numSubmission) {
        data.append('num_submit', this.state.numSubmission)
      }
      if (this.state.name) {
        data.append('name', this.state.name)
      }
      if (this.state.keywords) {
        data.append('keywords', this.state.keywords)
      }
      let response = await axios.put(this.apiBaseUrl + `courses/${this.courseId}/exercises/${this.exerciseId}/questions/${this.questionId}`, data, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
          return this.props.history.push(`/courses/${this.courseId}/exercises/${this.exerciseId}/questions/${this.questionId}/review`)
      } else {
        return NotificationManager.error("Something went wrong", 'Error!', 5000);
      }
    } catch (error) {
      console.log(error)
      if (error.response && error.response.data && error.response.data.code !== 200) {
        return NotificationManager.error(error.response.data.msg, 'Error!', 5000);
      }
      return NotificationManager.error("Something went wrong", 'Error!', 5000);

    }

  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    let nameSolution = ''
    let nameTestcase = ''
    let nameSource = ''
    if (!this.state.selectedSolutionFile) {
      nameSolution = this.state.solution || 'No file chose'
    } else {
      nameSolution = this.state.selectedSolutionFile.name
    }
    if (!this.state.selectedSourcecodeFile) {
      nameSource = this.state.sourcecode || 'No file chose'
    } else {
      nameSource = this.state.selectedSourcecodeFile.name
    }
    if (!this.state.selectedTestcaseFile) {
      nameTestcase = this.state.testcase || 'No file chose'
    } else {
      nameTestcase = this.state.selectedTestcaseFile.name
    }

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12">
            <Fade timeout={this.state.timeout} in={this.state.fadeIn}>
              <Card>
                <CardHeader>
                  <i className="fa fa-edit"></i>Update question
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
                              <Input id="appendedInput" size="16" value={this.state.name} type="input" placeholder='Name' onChange={this.handleName}/>                       
                            </InputGroup>
                          </div>
                        </FormGroup>
                        <FormGroup>
                          <Label htmlFor="appendedInput">Keywords</Label>
                          <div className="controls">
                            <InputGroup>
                              <Input id="appendedInput" size="16" value={this.state.keywords} type="input" placeholder='Name' onChange={this.handleKeyWord}/>                       
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
                            <Input id="appendedInput" min={1} value={this.state.numSubmission} size="16" type="number" placeholder='' onChange={this.handleNumerSubmission}/>
                          </Col>
                        </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="file-input">source code file (only one cpp file contain #TODO)</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Label for="sourcecode" className="custom-file-upload">
                            <i className="fa fa-cloud-upload"></i> {nameSource}
                          </Label>
                          <Input type="file" className='file-upload' id="sourcecode" name="sourcecode" onChange={this.handleSelectedSourcecodeFile} />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="file-input">testcase file (zip file contains text file)</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Label for="testcase" className="custom-file-upload">
                            <i className="fa fa-cloud-upload"></i> {nameTestcase}
                          </Label>
                          <Input type="file" className='file-upload' id="testcase" name="testcase" onChange={event => this.handleSelectedTestcaseFile(event)} />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="file-multiple-input">solution file (only one cpp file)</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Label for="solution" className="custom-file-upload">
                            <i className="fa fa-cloud-upload"></i>
                            {nameSolution}
                          </Label>
                          <Input type="file" className='file-upload' id="solution" name="solution" onChange={this.handleSelectedSolutionFile} />
                        </Col>
                      </FormGroup>
                      <div className="form-actions">
                        <Button color="primary" size="sm" onClick={event => this.handleSubmitClick(event)}>Submit</Button>
                        <Button color="primary" size="sm" onClick={(event) => this.handleReview(event)}>Preview</Button>
                        <Button color="secondary" size="sm" onClick={(event) => this.props.history.push(`/courses/${this.courseId}/exercises/${this.exerciseId}/questions`)}>Cancel</Button>
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
