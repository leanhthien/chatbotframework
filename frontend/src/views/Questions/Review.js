import React, { Component } from 'react';
import {
  Form,
  FormGroup,
  ListGroup,
  Button,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Jumbotron,
  Table,
  PopoverHeader,
  PopoverBody,
  Popover
} from 'reactstrap';
import MonacoEditor from '@uiw/react-monacoeditor'
import axios from 'axios';
import moment from 'moment'
import Swal from 'sweetalert'
import cookie from 'react-cookies';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import renderHTML from 'react-render-html'
import './Question.css'


class Course extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.courseId = this.props.match.params.id;
    this.exerciseId = this.props.match.params.exerciseId;
    this.questionId = this.props.match.params.questionId;
    this.state = {
      popoverOpens: {},
      numSubmission: 5,
      countSubmit: 0,
      description: '',
      collapse: true,
      fadeIn: true,
      name: '',
      keywords: '',
      role: 0,
      results: [],
      rows: [],
      question: null
    };
    this.toggle = this.toggle.bind(this)
    this.togglePopup = this.togglePopup.bind(this)
  }

  async componentDidMount() {
    try {
      let authen = await this.checkPermission();
      let question = await this.getQuestion()
      this.genCode(question.sourcecode)
      this.setState({ role: authen.role, question: question });
      this.getSumissions()

    }
    catch (error) {
      console.log(error)
    }
  }

  toggle(id) {
    var popoverOpens = { ...this.state.popoverOpens } || {}
    popoverOpens[id] = !this.state.popoverOpens[id]
    this.setState({ popoverOpens });
  }
  togglePopup(id) {
    let { questions, isOpenPopup } = this.state
    if (id && !isNaN(id)) {
      let question = questions.find(item => item.id === id)
      this.setState({ previewQuestions: question })
    }
    this.setState({ isOpenPopup: !isOpenPopup })
  }
  handleRemoveClick(event, id) {
    this.toggle(id)
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


  stuGenJumbotron (content) {
    if (content) {
      content = renderHTML(content)
      return <Jumbotron>{content}</Jumbotron>
    }
    else
      return;
  }

  async editorDidMount(editor, monaco, id, myIndex) {
    const contentHeight = await editor.getModel().getLineCount() * 19
    editor.layout({
      height: contentHeight,
    })
    editor.focus();
  }

  genCode(code) {
    if (!code) return
    let problem = [];
    let aparts = code.split('#TODO');
    for (let i = 0; i < aparts.length; i++) {
      problem.push(aparts[i]);
      if (i !== aparts.length - 1) {
        problem.push('#TODO');
      }
    }
    problem.forEach((element, myIndex) => {
      if (element !== '#TODO') {
        this.setState({ ['content_' + myIndex]: element })
      } else {
        this.setState({ ['content_' + myIndex]: '// TODO\n\n' })
      }
    });
  }

  stuGenCode (code) {
    if (!code) {
      return <p>no code</p>;
    }
    let problem = [];
    let aparts = code.split('#TODO');
    for (let i = 0; i < aparts.length; i++) {
      problem.push(aparts[i]);
      if (i !== aparts.length - 1) {
        problem.push('#TODO');
      }
    }
    let children = [];
    const options = {
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      automaticLayout: true,
      theme: 'monokai',
      scrollBeyondLastLine: false,
    };
    problem.forEach((element, myIndex) => {
      if (element === '#TODO') {
        children.push(<FormGroup row key={myIndex}>
          <Col xs="12" md="12">
            <div>
              <MonacoEditor
                ref="monaco"
                height="50vh"
                language="cpp"
                editorDidMount={this.editorDidMount}
                value={this.state['content_' + myIndex]}
                placeholder={'// TODO'}
                onChange={(newValue) => this.setState({ ['content_' + myIndex]: newValue })}
                options={options}
                scrollbar={{
                  useShadows: false,
                  verticalHasArrows: true,
                  horizontalHasArrows: true,
                  vertical: 'visible',
                  horizontal: 'visible',
                  verticalScrollbarSize: 17,
                  horizontalScrollbarSize: 17,
                  arrowSize: 30,
                }}
              />
            </div>
          </Col>
        </FormGroup>);
      }
      else {
        children.push(
          <MonacoEditor key={`${myIndex}`}
            ref="monaco"
            height={'auto'}
            width={'100%'}
            language="cpp"
            editorDidMount={(editor, monaco) => this.editorDidMount(editor, monaco, myIndex)}
            value={element}
            onChange={(newValue) => { }}
            options={{
              automaticLayout: true,
              lineNumbers: 'off',
              readOnly: true,
              scrollBeyondLastLine: false,
              renderSideBySide: false
            }}

          />
        )
      }
    });
    return children;
  }
  processingDataTableForTestcase(testcase) {
    if (testcase && testcase.length < 1) return <tr />
    return (
      testcase.map((value, index) => {
        if (!testcase[index]) return <tr key={'trblank' + index} className='blank-row' />
        return (
          <tr key={'trblank' + index}>
            <td> {index + 1}</td>
            <td >
              {value}
            </td>
          </tr>
        )
      })
    )
  }

  genStudentQuestionTestCase() {
    try {
      let testcaseBuf = new Buffer(this.state.question.show_testcase)
      let arrayTestcase = testcaseBuf.toString('utf8').split(';')
      return <div className='customers-table' >
        <i className="fa fa-align-justify"></i><strong>Testcase</strong>
        <div className='scroll-responsive' >
          <Table responsive striped>
            <thead>
              <tr>
                <th>No</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {this.processingDataTableForTestcase(arrayTestcase)}
            </tbody>
          </Table>
        </div>
      </div>
    } catch (error) {
      console.log(error)
    }

  }

  processingDataTable(rows) {
    //const { rows = [] } = this.state
    if (rows && rows.length < 1) return <tr />
    return (
      rows.map((value, index) => {
        if (!rows[index]) return <tr key={'trblank' + index} className='blank-row' />
        const row = rows[index]
        return (
          <tr key={'trblank' + index}>
            <td> {row['status'] === 0 ? 'grading...' : row['Success/total']}</td>
            <td >
              <div >
                <Button style={{ background: '#fff' }} id={`popover_${row['id']}`} type="button" onClick={event => this.handleRemoveClick(event, `${row['id']}`)}>Show detail</Button>
                <Popover placement="right" isOpen={this.state.popoverOpens[`${row['id']}`]} target={`popover_${row['id']}`} toggle={this.toggle.bind(this)}>
                  <PopoverHeader>Testcase Detail</PopoverHeader>
                  <PopoverBody ><div style={{ whiteSpace: 'pre' }}>{row['status'] === 0 ? 'grading...' : row['Logs']}</div></PopoverBody>
                </Popover>
              </div>
            </td>
          </tr>
        )
      })
    )
  }

  genStudentQuestion(question_id) {
    if (!this.state.rows || this.state.rows.length <= 0) {
      return []
    }

    let sumissions = this.state.rows.filter(item => {
      if (item['ID Question'] === question_id) return true;
      else return false;
    });
    console.log("sumissions", sumissions)
    return <div className='customers-table'>
      <div className='scroll-responsive'>
        <Table responsive striped>
          <thead>
            <tr>
              <th>Success/Total</th>
              <th>Logs</th>
            </tr>
          </thead>
          <tbody>
            {this.processingDataTable(sumissions)}
          </tbody>
        </Table>
      </div>
    </div>
  }

  async getResultsQuestion() {
    try {
      let exerciseId = this.props.match.params.exerciseId;
      let response = await axios.get(`${this.apiBaseUrl}courses/${this.courseId}/exercises/result/${exerciseId}`, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return response.data.data;
      }
      else {
        return null;
      }
    }
    catch (error) {
      console.log(error);
      return null;
    }
  }

  async getSumissions() {
    let results = await this.getResultsQuestion();
    this.setState({ results: results });
    if (!results || results.length <= 0) return
    results = results.sort((a, b) => {
      if (a.questionId < b.questionId) {
        return -1;
      } else if (a.questionId > b.questionId) {
        return 1;
      } else {
        if (a && moment(a.createdAt).isValid() && b && moment(b.createdAt).isValid() &&
          moment(a.createdAt).isAfter(b.createdAt)) {
          return -1
        }
        else {
          return 1
        }
      }
    });
    let rows = []
    results.forEach(item => {
      let object = {}
      object['id'] = item.id
      object['ID Question'] = item.questionId
      object['Time submit'] = moment(item.createdAt).local().format('LLLL')
      object['Success/total'] = `${item.num_success}/${item.num_testcase}`
      let buf = new Buffer(item.log)
      object['Logs'] = buf.toString()

      //console.log(buf.toString())

      var popoverOpens = { ...this.state.popoverOpens }
      popoverOpens[object['id']] = false;
      this.setState({ popoverOpens })

      object['status'] = item.status
      rows.push(object)
    })
    this.setState({ rows: rows })
  }

  async stuHandleSubmitClick(event, numSubmit, id) {
    try {
      let keys = Object.keys(this.state);
      let contentOfId = keys.filter(x => x.includes('content_'));
      let allCode = '';
      for (let i = 0; i < contentOfId.length; i++) {
        allCode += this.state['content_' + i];
      }
      let data = {
        code: allCode,
        question_id: id
      }
      let response = await axios.post(this.apiBaseUrl + 'submitcode', data, { headers: { "Authorization": `Bearer ${this.token}` } });
      console.log(response.data)
      if (response.data.data) {
        let sumissions = response.data.data
        this.getSumissions()
        return this.setState(() => {
          let message = ''
          if (sumissions.countSubmissions) {
            this.setState({
              countSubmit: sumissions.countSubmissions
            })
            message = `You have ${numSubmit - sumissions.countSubmissions} submissions`
          }
          return Swal('Success', message, 'success')
        })
      } else {
        return NotificationManager.error(response.data.msg || 'Something went wrong, please try again!', 'Error!', 5000);
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.code !== 200) {
        return NotificationManager.error(error.response.data.msg, 'Error!', 5000);
      }
      return NotificationManager.error("Something went wrong", 'Error!', 5000);
    }

  }
  async handlePublicClick(event, id) {
    try {
      let response = await axios.post(this.apiBaseUrl + `courses/${this.courseId}/exercises/${this.exerciseId}/questions/review/${id}`, null, { headers: { "Authorization": `Bearer ${this.token}` } });
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

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    return (
      <div className="animated fadeIn">
        <Row >
          <Col xs="12" md="12">
            <Card>
              <CardHeader>
                <strong>#ID : {this.state.question ? this.state.question.id : ''}&nbsp;&nbsp;  {this.state.question ? this.state.question.name : ''}</strong>
              </CardHeader>
              <CardBody>
                <Row form>
                  <Col md={9}>
                    {this.state.question ? this.stuGenJumbotron(this.state.question.description) : null}
                    <Form action="" method="post" encType="multipart/form-data" className="form-horizontal">
                      {this.state.question ? this.stuGenCode(this.state.question.sourcecode) : null}
                    </Form>
                  </Col>
                  <Col md={3} >
                    <Row className='justify-content-center' style={{ maxHeight: 600 }} >
                      <div className='scroll-responsive question-review-show-testcase'>
                        <ListGroup >
                          {this.genStudentQuestionTestCase()}
                        </ListGroup>
                      </div>
                    </Row>

                    <Row className='justify-content-center' style={{ marginTop: 60 }}>
                      <ListGroup className='question-review-show-result'>
                        {this.state.question ? this.genStudentQuestion(this.state.question.id) : null}
                      </ListGroup>
                    </Row>

                  </Col>
                </Row>

              </CardBody>
              <CardFooter>
                <div><Button
                  // title={e.countSubmit && e.num_submit && e.countSubmit >= e.num_submit ? 'The number of submissions exceeds the number of times allowed' : ''}
                  type="submit" size="sm" color="primary" onClick={event => this.stuHandleSubmitClick(event, this.state.question.num_submit, this.state.question.id)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
                  <Button type="submit" size="sm" color="primary" onClick={event => this.handlePublicClick(event, this.state.question.id)}><i className="fa fa-dot-circle-o"></i> Publish</Button>
                  <Button type="reset" size="sm" color="danger" onClick={(event) => this.props.history.push(`/courses/${this.courseId}/exercises/${this.exerciseId}/questions/update/${this.questionId}`)}><i className="fa fa-ban"></i> Update</Button>
                  <Button type="reset" size="sm" color="danger" onClick={(event) => this.props.history.push(`/courses/${this.courseId}/exercises/${this.exerciseId}/questions`)}><i className="fa fa-ban"></i> Cancel</Button>
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row >
        <NotificationContainer />
      </div>
    );
  }
}

export default Course;
