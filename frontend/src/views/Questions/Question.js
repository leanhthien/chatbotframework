import React, { Component } from 'react';
import {
  ListGroup,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  CardFooter,
  Jumbotron,
  Form,
  FormGroup,
  Label,
  Popover,
  PopoverHeader,
  PopoverBody,
  Table
} from 'reactstrap';
import axios from 'axios';
import cookie from 'react-cookies'
import moment from 'moment'
import Swal from 'sweetalert'
import './Question.css'
import MonacoEditor from '@uiw/react-monacoeditor'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import '../Exercises/Results.css'
import renderHTML from 'react-render-html'
const TimeLoadResult = 12 * 1000
let IsGetResult = true
class Exercise extends Component {
  divStyle = {
    'whiteSpace': 'pre-wrap'
  }
  divDescription = {
    height: '33px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
    cursor: 'pointer',
    width: '100%'
  }
  styleCode = {
    padding: '5px 0px',
    border: '1px solid #c8ced3'
  }
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.courseId = this.props.match.params.id;
    this.exerciseId = this.props.match.params.exerciseId;
    this.state = {
      popoverOpens: {},
      tooltipOpens: {},
      role: 0,
      questions: [],
      card3: false,
      code: [],
      todoIds: [],
      results: [],
      testcaseByQuestionId: [],
      showTestcase: ''
    };
    this.genCode = this.genCode.bind(this)
    this.toggle = this.toggle.bind(this)
    this.toggleToolTip = this.toggleToolTip.bind(this)
    this.togglePopup = this.togglePopup.bind(this)
  }

  toggleToolTip(id) {
    var tooltipOpens = { ...this.state.tooltipOpens } || {}
    tooltipOpens[id] = !this.state.tooltipOpens[id]
    this.setState({ tooltipOpens });
  }

  toggle(id) {
    var popoverOpens = { ...this.state.popoverOpens } || {}
    popoverOpens[id] = !this.state.popoverOpens[id]
    this.setState({ popoverOpens });
  }

  async componentDidMount() {
    IsGetResult = true
    try {
      let authen = await this.checkPermission();
      this.setState({ role: authen.role });
      let questions = []
      if (authen.role === 2 || authen.role === 3) {
        questions = await this.getQuestions();
      }
      if (authen.role === 1) {
        let testcaseByQuestionId = []
        questions = await this.getQuestionsForStudent()
        questions.forEach(element => {
          let showTestcaseBuf = new Buffer(element.show_testcase)
          let showTestcase = showTestcaseBuf.toString('utf8')
          testcaseByQuestionId.push({
            id: element.id,
            testcase: showTestcase
          })
        });
        this.setState({ questions: questions, testcaseByQuestionId: testcaseByQuestionId });
        this.getSumissions()
      }
      if (questions) {
        questions = questions.map(item => {
          item.description = renderHTML(item.description)
          return item
        })
      }
      this.setState({ questions: questions });

      if (questions && questions.length > 0) {
        questions.forEach(x => {
          var popoverOpens = { ...this.state.popoverOpens }
          let tooltipOpens = { ...this.state.tooltipOpens }
          tooltipOpens[x.id] = false
          popoverOpens[x.id] = false;
          this.setState({ popoverOpens, tooltipOpens })
          if (authen.role === 1) {
            this.genCode(x.sourcecode, x.id)
          }
        })
      }
    } catch (error) {
      console.log(error)
    }

  }

  componentWillUnmount () {
    IsGetResult = false
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


  genCode(code, id) {
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
        this.setState({ ['content_' + id + '_' + myIndex]: element })
      } else {
        let { todoIds } = this.state
        todoIds.push({ id, key: 'content_' + id + '_' + myIndex })
        this.setState({ ['content_' + id + '_' + myIndex]: '// TODO\n\n' })
      }
    });
  }

  async getQuestions() {
    try {
      let response = await axios.get(`${this.apiBaseUrl}courses/${this.courseId}/exercises/${this.exerciseId}/questions`, { headers: { "Authorization": `Bearer ${this.token}` } });
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

  async getQuestionsForStudent() {
    try {
      let response = await axios.get(`${this.apiBaseUrl}courses/${this.courseId}/exercises/${this.exerciseId}/questions/student`, { headers: { "Authorization": `Bearer ${this.token}` } });
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
      this.props.history.push("/login");
    };
  }

  handleAddClick(event) {
    return this.props.history.push(`/courses/${this.courseId}/exercises/${this.exerciseId}/questions/create`);
  }

  handleEditClick(event, id) {
    return this.props.history.push(`/courses/${this.courseId}/exercises/${this.exerciseId}/questions/update/${id}`);
  }

  async handlePublicClick(event, id) {
    try {
      let response = await axios.post(this.apiBaseUrl + `courses/${this.courseId}/exercises/${this.exerciseId}/questions/review/${id}`, null, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        let questions = await this.getQuestions();
        if (questions) {
          questions = questions.map(item => {
            item.description = renderHTML(item.description)
            return item
          })
        }
        this.setState({ questions: questions });
        return NotificationManager.success('Public question successful', 'Success', 5000)
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

  handleRemoveClick(event, id) {
    this.toggle(id)
  }

  async handleDeleteClick(event, exercise_id, question_id) {
    try {
      let response = await axios.delete(this.apiBaseUrl + `courses/${this.courseId}/exercises/${exercise_id}/questions/${question_id}`, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        // return window.location.reload(); 
        let questions = await this.getQuestions();
        if (questions) {
          questions = questions.map(item => {
            item.description = renderHTML(item.description)
            return item
          })
        }
        this.setState({ questions: questions });
      }
    }
    catch (error) {
      console.log(error);
    };
  }

  togglePopup(id) {
    let { questions, isOpenPopup } = this.state
    if (id && !isNaN(id)) {
      let question = questions.find(item => item.id === id)
      this.setState({ previewQuestions: question })
    }
    this.setState({ isOpenPopup: !isOpenPopup })
  }

  handlePermissionClick(event, id) {
    return this.props.history.push({ pathname: `/courses/${this.courseId}/exercises/${this.exerciseId}/questions/${id}/permission`, state: { courseId: this.courseId } });
  }
  handleDownloadClick(event, id) {
    let question = this.state.questions.filter((item) => {
      if (item.id === id) return true
      return false
    })
    if (question) {
      let solutionBuf = new Buffer(question[0].solution)
      let solution = solutionBuf.toString('utf8')

      let element = document.createElement("a");
      let file = new Blob([solution], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Solution_${question[0].name}.cpp`;
      element.click();
    }
  }
  handlePermissionAllClick() {
    return this.props.history.push({ pathname: `/courses/${this.courseId}/exercises/${this.exerciseId}/questions/permissions`, state: { courseId: this.courseId } });
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
  genTeacherQuestions = () => {
    let group = [];
    if (!this.state.questions || this.state.questions.length <= 0) return <tr />
    this.state.questions.forEach((element, index) => {
      group.push(
        <tr key={index}>
          <td>
            {index + 1}
          </td>
          <td>
            {element.id}
          </td>
          <td>
            {element.name}
          </td>
          <td>
            <div className="container">
              <div className="row">
                <div className="col-10">
                  <span id={`tooltip_${element.id}`} onClick={() => this.toggleToolTip(element.id)} className='question-description' style={this.divDescription} >
                    {element.description ? element.description : ''}               
                  </span>                        
                </div>
                <div className="col-2 float-right">
                  <Popover className={'description-question-popOver'} placement="left" isOpen={this.state.tooltipOpens[element.id]} target={`tooltip_${element.id}`} toggle={() => this.toggleToolTip(element.id)}>
                    <PopoverHeader>{`#${element.id} : ${element.name}`}</PopoverHeader>
                    <PopoverBody className={'description-question-popover-body'} >{element.description ? element.description : ''}</PopoverBody>
                  </Popover>
                </div>
              </div>
            </div>           
          </td>
          <td>
            {element.is_review === 1 ? 'public' : 'private'}
          </td>
          <td>
            <i title={'Edit'} className={`fa fa-edit btn-link icon_handle_question`} onClick={event => this.handleEditClick(event, element.id)}></i>
            {element.is_review === 0 ? <i className={`fa fa-spotify btn-link icon_handle_question`} title={'Publish'} onClick={event => this.handlePublicClick(event, element.id)}></i> :''}
            <i title={'Download solution'} className="fa fa-download btn-link icon_handle_question" onClick={event => this.handleDownloadClick(event, element.id)}></i>
            <i title={'Remove'} className="fa fa-trash-o btn-link icon_handle_question" id={`popover_${element.id}`}
            onClick={event => this.handleRemoveClick(event, element.id)}>
            </i>
            <Popover placement="right" isOpen={this.state.popoverOpens[element.id]} target={`popover_${element.id}`} toggle={this.toggle}>
              <PopoverHeader>Do you want to remove <strong>{element.name}</strong>?</PopoverHeader>
              <PopoverBody>
                <Button type="text" size="sm" color="danger" onClick={event => this.handleDeleteClick(event, element.exerciseId, element.id)}><i className="fa fa-dot-circle-o"></i> Remove</Button>
              </PopoverBody>
            </Popover>
          </td>
        </tr>
      )
    });
    return group;
  }

  checkViewRole = () => {
    if (this.state.role === 1) {
      return this.stuGenQuestion();
    }
    else if (this.state.role === 2 || this.state.role === 3) {
      return (
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Questions</strong>
                <Label style={{ float: 'right', marginRight: '30px' }}>Assign questions<i title={'Assign many questions'} className="fa fa-flag btn-link icon_handle_question"
                  onClick={event => this.handlePermissionAllClick()}></i> </Label>
              </CardHeader>
              <CardBody>
                <ListGroup>
                  <Table responsive striped>
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.genTeacherQuestions()}
                    </tbody>
                  </Table>
                </ListGroup>
              </CardBody>
              <CardFooter>
                <Button type="text" size="sm" color="primary" onClick={event => this.handleAddClick(event)}><i className="fa fa-dot-circle-o"></i> Add</Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      )
    }
    else {
      return this.loading();
    }
  }

  // student
  async stuHandleSubmitClick(event, id) {
    try {
      let keys = Object.keys(this.state);
      let contentOfId = keys.filter(x => x.includes('content_' + id));
      let allCode = '';
      for (let i = 0; i < contentOfId.length; i++) {
        allCode += this.state['content_' + id + '_' + i];
      }
      let data = {
        code: allCode,
        question_id: id
      }
      let response = await axios.post(this.apiBaseUrl + 'submitcode', data, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        let { questions } = this.state
        let question = {}
        questions = questions.map(item => {
          if (item.id === id) {
            item.countSubmit = response.data.data.countSubmissions
            question = item
          }
          return item
        })
        this.getSumissions()
        return this.setState({ questions }, () => {
          let message = ''
          if (question.num_submit && question.countSubmit) {
            message = `You have ${question.num_submit - question.countSubmit} submissions`
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
  processingDataTable(rows) {
    //const { rows = [] } = this.state
    if (rows && rows.length < 1) return <tr />
    if (this.state.role === 1) {
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
  }
  genStudentQuestionTestCase(id) {
    let showTestcase = this.state.testcaseByQuestionId.filter((item) => {
      if (item.id === id) return true
      return false;
    })
    let arrayTestcase = showTestcase[0].testcase.split(';')
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
    this.setState({ rows })
    setTimeout(() => {
      if (IsGetResult) {
        this.getSumissions()
      }
    }, TimeLoadResult);
  }
  genStudentQuestion(question_id) {
    if (!this.state.rows || this.state.rows.length <= 0) {
      return []
    }

    let sumissions = this.state.rows.filter(item => {
      if (item['ID Question'] === question_id) return true;
      else return false;
    });


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

  async stuHanleRestClick(event, id) {
    let { todoIds } = this.state
    if (!todoIds || todoIds.length <= 0) return
    todoIds.forEach(item => {
      if (item.id === id) {
        this.setState({ [item.key]: '' })
      }
    })
  }


  stuHanleDwloadClick(event, sourcecode, id) {
    let element = document.createElement("a");
    let file = new Blob([sourcecode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Template_code_Question_${id}.cpp`;
    element.click();

  }

  stuGenJumbotron = (content) => {
    if (content) {
      return <Jumbotron>{content}</Jumbotron>
    }
    else
      return;
  }

  stuGenQuestion = () => {
    let children = [];
    if (!this.state.questions) {
      return children
    }
    let questions = this.state.questions

    if (!questions || questions.length <= 0) return
    questions = questions.sort((a, b) => {
      if (a.limit.order < b.limit.order) {
        return -1;
      } else {
        return 1
      }
    });

    questions.forEach((e, index) => {
      let isOverTime = false
      let localTime = ''
      if (e && e.limit.end && moment(e.limit.end).isValid()) {
        if (moment.utc().isAfter(e.limit.end)) {
          isOverTime = true;
        }
        let stillUtc = moment.utc(e.limit.end).toDate();
        localTime = moment(stillUtc).format('YYYY-MM-DD HH:mm:ss');
      }
      children.push(
        <Row key={index}>
          <Col xs="12" md="12">
            <Card>
              <CardHeader>
                <strong>#ID : {e.id}&nbsp;&nbsp;  {e.name}</strong>
                <Label style={{ float: 'right' }}>{e.num_submit ? `Number of sumissions: ${e.countSubmit}/${e.num_submit}` : 'Unlimited submission'}</Label>
                <Label style={{ float: 'right', marginRight: '30px' }}>{localTime ? `Expired time: ${localTime}` : `Unlimited time`}</Label>
              </CardHeader>
              <CardBody>
                <Row form>
                  <Col md={9}>
                    {this.stuGenJumbotron(e.description)}
                    <Form action="" method="post" encType="multipart/form-data" className="form-horizontal">
                      {this.stuGenCode(e.sourcecode, e.id, isOverTime || (e.countSubmit && e.num_submit && e.countSubmit >= e.num_submit))}
                    </Form>
                  </Col>
                  <Col md={3} >
                    <Row className='justify-content-center' style={{ maxHeight: 600 }} >
                      <div className='scroll-responsive question-review-show-testcase'>
                        <ListGroup >
                          {this.genStudentQuestionTestCase(e.id)}
                        </ListGroup>
                      </div>
                    </Row>

                    <Row className='justify-content-center' style={{ marginTop: 60 }}>
                      <ListGroup className='question-review-show-result'>
                        {this.genStudentQuestion(e.id)}
                      </ListGroup>
                    </Row>

                  </Col>
                </Row>

              </CardBody>
              <CardFooter>
                <div><Button disabled={!!(e.countSubmit && e.num_submit && e.countSubmit >= e.num_submit)}
                  title={e.countSubmit && e.num_submit && e.countSubmit >= e.num_submit ? 'The number of submissions exceeds the number of times allowed' : ''}
                  type="submit" size="sm" color="primary" onClick={event => this.stuHandleSubmitClick(event, e.id)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
                  <Button type="submit" size="sm" color="primary" onClick={event => this.stuHanleDwloadClick(event, e.sourcecode, e.id)}><i className="fa fa-dot-circle-o"></i> Download</Button>
                  <Button type="reset" size="sm" color="danger" onClick={event => this.stuHanleRestClick(event, e.id)}><i className="fa fa-ban"></i> Reset</Button>
                </div>
              </CardFooter>
            </Card>
          </Col>
        </Row >
      )
    })
    return children;
  }

  async editorDidMount(editor, monaco, id, myIndex) {
    const contentHeight = await editor.getModel().getLineCount() * 19
    editor.layout({
      height: contentHeight,
    })
    editor.focus();
  }

  stuGenCode = (code, id, isOverTime) => {
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
        children.push(<FormGroup row key={id + myIndex}>
          <Col xs="12" md="12">
            <div>
              <MonacoEditor
                ref="monaco"
                height="50vh"
                language="cpp"
                editorDidMount={this.editorDidMount}
                value={this.state['content_' + id + '_' + myIndex]}
                placeholder={'// TODO'}
                onChange={(newValue) => this.setState({ ['content_' + id + '_' + myIndex]: newValue })}
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
          <MonacoEditor key={`${id}_${myIndex}`}
            ref="monaco"
            height={'auto'}
            width={'100%'}
            language="cpp"
            editorDidMount={(editor, monaco) => this.editorDidMount(editor, monaco, id, myIndex)}
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

  render() {
    return (
      <div className="animated fadeIn" style={this.divStyle}>
        {this.checkViewRole()}
        <NotificationContainer />
      </div>
    );
  }
}

export default Exercise;
