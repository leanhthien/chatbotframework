import React, { Component } from 'react';
import {
  ListGroup,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  CardFooter, Modal, ModalHeader, ModalBody, ModalFooter,
  Popover,
  PopoverBody,
  PopoverHeader
} from 'reactstrap';
import axios from 'axios';
import _ from 'lodash'
import cookie from 'react-cookies'
import './Exercise.css'
import ReactHTMLTableToExcel from 'react-html-table-to-excel'
import renderHTML from 'react-render-html'
import './Results.css'
class ResultsByGroup extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.courseId = this.props.match.params.id;
    this.exerciseId = this.props.match.params.exerciseId;
    this.state = {
      popoverOpens: {},
      role: 0,
      results: [],
      card3: false,
      isOpenPopup: false,
      questions: [],
      question: null
    };
    this.togglePopup = this.togglePopup.bind(this)
    this.toggle = this.toggle.bind(this)
  }

  async componentDidMount() {
    try {
      let authen = await this.checkPermission();
      this.setState({ role: authen.role });
      let results = await this.getResults();
      let exercise = await this.getExercise()
      this.setState({ results: results, exercise });
      if (!results || results.length <= 0 || authen.role === 1) return
      let rows = []
      let questionIds = {}
      let object = {}
      results.forEach((item, index) => {
        let description = new Buffer(item.questionInfo.description)
        questionIds[item.questionId] = { description: description.toString(), questionId: item.questionId, num_testcase: item.num_testcase, name: item.questionInfo.name }
        if (object['ID Student'] !== item.userId) {
          if (!_.isEmpty(object)) {
            rows.push(object)
          }
          let code = new Buffer(item.data)
          object = {
            'Username': _.get(item, 'user.username'),
            'ID Student': _.get(item, 'user.id'),
            'Fullname': _.get(item, 'user.fullname'),
            grades: { [item.questionId]: item.status === 2 ? `${item.num_success}` : 'grading...' },
            'code': { [item.questionId]: code.toString() },
            'status': item.status
          }
          let buf = new Buffer(item.log)
          object['Logs'] = `\n Question: ${item.questionId} \n ${buf.toString()}`
        } else {
          let buf = new Buffer(item.log)
          let code = new Buffer(item.data)
          object.grades[item.questionId] = item.status === 2 ? `${item.num_success}` : 'grading...'
          object.code[item.questionId] = code.toString()
          object['Logs'] += `\n Question: ${item.questionId} \n ${buf.toString()}`
        }
        if (index === results.length - 1) {
          rows.push(object)
        }
      })
      questionIds = Object.keys(questionIds).map(function (key) {
        return questionIds[key]
      });
      questionIds = questionIds.sort((a, b) => {
        return a.questionId - b.questionId
      })
      this.setState({ rows, questionIds })
    } catch (error) {
      console.log(error)
    }
  }

  handleDetailLog(id) {
    this.toggle(id)
  }

  toggle(id) {
    var popoverOpens = { ...this.state.popoverOpens } || {}
    popoverOpens[id] = !this.state.popoverOpens[id]
    this.setState({ popoverOpens });
  }

  async getResults() {
    try {
      let exerciseId = _.get(this.props, 'match.params.exerciseId')
      let group_id = _.get(this.props, 'match.params.groupId')
      let response = await axios.get(`${this.apiBaseUrl}courses/${this.courseId}/exercises/result/${exerciseId}/groups/${group_id}`, { headers: { "Authorization": `Bearer ${this.token}` } });
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

  async getExercise() {
    try {
      let exerciseId = _.get(this.props, 'match.params.exerciseId')
      let response = await axios.get(`${this.apiBaseUrl}courses/${this.courseId}/exercises/${exerciseId}`, { headers: { "Authorization": `Bearer ${this.token}` } });
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

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  downloadCode(data, studentId, questionId) {
    var element = document.createElement("a");
    var file = new Blob([data], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Submission_${studentId}_${questionId}.cpp`;
    element.click();
  }

  async togglePopup(questionId) {
    let { isOpenPopup, questionIds } = this.state
    if (!questionId) return this.setState({ isOpenPopup: !this.state.isOpenPopup })
    if (!isOpenPopup) {
      let question = questionIds.find(item => item.questionId === questionId)
      this.setState({ question })
    }
    this.setState({ isOpenPopup: !this.state.isOpenPopup })
  }

  handleBackClick() {
    this.props.history.push(`/courses/${this.courseId}/exercises/result/${this.exerciseId}`)
  }

  processingDataTable(isShowlog) {
    const { rows = [], questionIds = [] } = this.state
    if (rows && rows.length < 1) return <tr />
    return (
      rows.map((value, index) => {
        if (!rows[index]) return <tr key={'trblank' + index} className='blank-row' />
        const row = rows[index]
        return (
          <tr key={'trblank' + index}>
            <td style={{ textAlign: "center" }}> {index + 1}</td>
            <td> {row['Username']}</td>
            <td> {row['Fullname']}</td>
            {
              questionIds.map(item => <td key={item.questionId}>
                {row.grades[item.questionId] ? <div onClick={(e) => this.downloadCode(row.code[item.questionId], row['Username'], item.questionId)} style={{ textAlign: 'center', cursor: 'pointer' }} title={'Click to download code of student'}>
                  {row.grades[item.questionId]}
                </div> : ''}
              </td>)
            }
            <td style={{ whiteSpace: 'pre' }}>
              {isShowlog ? row['Logs'] :
              <div >
                <div style={{ cursor: 'pointer', background: '#fff',  }} id={`popover_${row['ID Student']}`}  onClick={event => this.handleDetailLog(`${row['ID Student']}`)}>Show logs</div>
                <Popover placement="left-start" isOpen={this.state.popoverOpens[`${row['ID Student']}`]} target={`popover_${row['ID Student']}`} toggle={() => this.toggle(row['ID Student'])}>
                  <PopoverHeader>Logs Detail </PopoverHeader>
                  <PopoverBody style={{ whiteSpace: 'pre', maxHeight: '350px', overflowY: 'scroll' }}><div>{row['status'] === 0 ? 'grading...' : row['Logs']}</div></PopoverBody>
                </Popover>
              </div>
              }
            </td>
          </tr>
        )
      })
    )
  }
  genTeacherExercises() {
    if (!this.state.rows || this.state.rows.length <= 0) {
      return []
    }
    let { questionIds = [] } = this.state
    return <div className='customers-table'>
      <div className='scroll-responsive' style={{ overflowX: questionIds.length > 5 ? 'auto' : '' }}>
        <table>
          <tbody>
            <tr>
              <th style={{ minWidth: 50, fixed: 'left' }} rowSpan={2}>Index</th>
              <th style={{ minWidth: 100, }} rowSpan={2}>Id Student</th>
              <th style={{ minWidth: 150 }} rowSpan={2}>Fullname</th>
              <th style={{ minWidth: questionIds.length * 110 + 100 }} colSpan={questionIds.length || 1}>Results</th>
              <th style={{ minWidth: 100, fixed: 'right', whiteSpace: 'pre' }} rowSpan={2}>Logs</th>
            </tr>
            <tr>
              {
                questionIds.map(item =>
                  <td style={{ textAlign: 'center' }} key={item.questionId}>
                    <div>
                      <div title={'Click here to show init code'} id={'questionIds'} style={{ cursor: 'pointer' }} onClick={event => this.togglePopup(item.questionId)}>
                        {`${item.questionId}: ${item.name}  (${item.num_testcase})`}
                      </div>
                    </div>
                  </td>)
              }
            </tr>
            {this.processingDataTable()}
          </tbody>
        </table>
        <table style={{ display: 'none' }} id='id-table-xls'>
          <tbody>
            <tr>
              <th style={{ minWidth: 50, fixed: 'left' }} rowSpan={2}>Index</th>
              <th style={{ minWidth: 100, fixed: 'left' }} rowSpan={2}>Id Student</th>
              <th style={{ minWidth: 150 }} rowSpan={2}>Fullname</th>
              <th style={{ minWidth: questionIds.length * 80 + 90 }} colSpan={questionIds.length || 1}>Results</th>
              <th style={{ minWidth: 220, fixed: 'right', whiteSpace: 'pre' }} rowSpan={2}>Logs</th>
            </tr>
            <tr>
              {
                questionIds.map(item =>
                  <td style={{ textAlign: 'center' }} key={item.questionId}>
                    <div style={{ cursor: 'pointer !important' }}>{`${item.questionId}: ${item.name} (${item.num_testcase})`}</div>
                  </td>)
              }
            </tr>
            {this.processingDataTable(true)}
          </tbody>
        </table>
      </div>
    </div>
  }

  checkViewRole = () => {
    let courseId = _.get(this.props, 'match.params.id')
    let nameGroup = _.get(this.state.results, '[0].user.groups[0].name') || ''
    const { exercise } = this.state
    if (this.state.role === 3 || this.state.role === 2) {
      return (
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Result {nameGroup ? ` of the ${nameGroup} on ${exercise.name}` : ' exercises'}</strong>
              </CardHeader>
              <CardBody>
                <ListGroup>
                  {this.genTeacherExercises()}
                </ListGroup>
              </CardBody>
              <CardFooter>
                {this.state.role === 2 || this.state.role === 3 ? <div>
                  <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button"
                    table="id-table-xls"
                    filename={`grading_${nameGroup}`}
                    sheet="grading"
                    style={{ color: 'white' }}
                    buttonText="Export to CSV" />
                  <Button type="reset" size="sm" color="danger" onClick={event => this.props.history.push(`/courses/${courseId}/exercises`)}><i className="fa fa-ban"></i> Cancel</Button>
                  <Button type="button" size="sm" color="primary" onClick={event => this.handleBackClick(event)}><i className="fa fa-dot-circle-o"></i> Back</Button>
                </div> : ''}
              </CardFooter>
            </Card>
          </Col>
        </Row>
      )
    } else {
      return this.loading()
    }

  }

  render() {
    let { question } = this.state
    return (
      <div className="animated fadeIn">
        {this.checkViewRole()}
        {question ? <Modal isOpen={this.state.isOpenPopup} toggle={this.togglePopup} className={'model-preview-question'}>
          <ModalHeader toggle={this.togglePopup}>{`#ID ${question.questionId} ${question.name}`}</ModalHeader>
          <ModalBody>
            <div >
              {renderHTML(question.description)}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.togglePopup}>Cancel</Button>
          </ModalFooter>
        </Modal> : ''}
      </div>
    );
  }
}

export default ResultsByGroup;
