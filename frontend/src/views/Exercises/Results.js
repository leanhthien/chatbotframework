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
  Popover,
  PopoverHeader,
  PopoverBody,
  Table
} from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash'
import cookie from 'react-cookies'
import './Exercise.css'
import moment from 'moment'
import './Results.css'
class Results extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.courseId = this.props.match.params.id;
    this.exerciseId = this.props.match.params.exerciseId;
    this.toggle = this.toggle.bind(this);
    this.state = {
      popoverOpens: {},
      role: 0,
      results: [],
      groups: [],
      card3: false
    };
  }

  handleRemoveClick(event, id) {
    this.toggle(id)
  }

  toggle(id) {
    if (!this.state.popoverOpens) return
    var popoverOpens = { ...this.state.popoverOpens } || {}
    Object.keys(popoverOpens).forEach(function (key) {
      popoverOpens[key] = false
    });
    popoverOpens[id] = !this.state.popoverOpens[id]
    this.setState({ popoverOpens });
  }
  async componentDidMount() {
    try {
      let authen = await this.checkPermission();
      this.setState({ role: authen.role });
      if (authen.role === 1) {
        let results = await this.getResults();
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
          let code = new Buffer(item.data)
          object['code'] = code.toString()
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

      } else {
        let groups = await this.getGroups();
        this.setState({ groups: groups });
      }
    }
    catch (error) {
      console.log(error)
    }

  }

  async getGroups() {
    try {
      let response = await axios.get(this.apiBaseUrl + `courses/${this.courseId}/groups`, { headers: { "Authorization": `Bearer ${this.token}` } });
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

  async getResults() {
    try {
      let exerciseId = _.get(this.props, 'match.params.exerciseId')
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
  downloadCode(data, questionId) {
    var element = document.createElement("a");
    var file = new Blob([data], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Submission_${questionId}.cpp`;
    element.click();
  }
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
  processingDataTable() {
    const { rows = [] } = this.state
    if (rows && rows.length < 1) return <tr />
    if (this.state.role === 1) {
      return (
        rows.map((value, index) => {
          if (!rows[index]) return <tr key={'trblank' + index} className='blank-row' />
          const row = rows[index]
          return (
            <tr key={'trblank' + index}>
              <td> {row['ID Question']}</td>
              <td> {row['Time submit']}</td>
              <td title={'Click here to download the submission'} onClick={(e) => this.downloadCode(row['code'], row['ID Question'])} style={{ textAlign: 'center', cursor: 'pointer' }}>
                {row['status'] === 0 ? 'grading...' : row['Success/total']}
              </td>
              <td >
                <div >
                  <Button id={`popover_${row['id']}`} type="button" onClick={event => this.handleRemoveClick(event, `${row['id']}`)}>Click to detail</Button>
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
  genStudentExercises() {
    if (!this.state.rows || this.state.rows.length <= 0) {
      return []
    }
    return <div className='customers-table'>
      <div className='scroll-responsive'>
        <table>
          <tbody>
            <tr>
              <th style={{ minWidth: 100, fixed: 'left' }}>Id Question</th>
              <th style={{ minWidth: 250 }}>Time submit</th>
              <th style={{ minWidth: 100 }}>Success/Total</th>
              <th style={{ minWidth: 320, fixed: 'right', whiteSpace: 'pre' }}>Logs</th>
            </tr>
            {this.processingDataTable()}
          </tbody>
        </table>
      </div>
    </div>
  }

  genGroup = () => {
    let group = [];
    if (!this.state.groups) return <tr />
    this.state.groups.forEach((element, index) => {
      group.push(<tr key={element.id}>
        <td><strong>{index + 1} </strong></td>
        <td>
          <Link to={`/courses/${this.courseId}/exercises/resultgroup/${this.exerciseId}/${element.id}`}>{element.name}</Link>
        </td>
      </tr>)
    });
    return group;
  }

  handleBackClick () {
    this.props.history.push(`/courses/${this.courseId}/exercises/${this.exerciseId}`)
  }

  checkViewRole = () => {
    if (this.state.role === 1) {
      return (
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Result exercises</strong>
              </CardHeader>
              <CardBody>
                <ListGroup>
                  {this.genStudentExercises()}
                </ListGroup>
              </CardBody>
              <CardFooter>
               <Button type="button" size="sm" color="primary" onClick={event => this.handleBackClick(event)}><i className="fa fa-dot-circle-o"></i> Back</Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      )
    }
    if (this.state.role === 2 || this.state.role === 3) {
      return (
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Choose group</strong>
              </CardHeader>
              <CardBody>
                <Table>
                  <thead>
                    <tr>
                    <th>No</th>
                    <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.genGroup()}
                  </tbody>
                </Table>
              </CardBody>
              <CardFooter>
               <Button type="button" size="sm" color="primary" onClick={event => this.handleBackClick(event)}><i className="fa fa-dot-circle-o"></i> Back</Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      )
    }

  }

  render() {
    return (
      <div className="animated fadeIn">
        {this.checkViewRole()}
      </div>
    );
  }
}

export default Results;
