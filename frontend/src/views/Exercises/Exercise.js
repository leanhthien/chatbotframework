import React, { Component } from 'react';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  Popover,
  PopoverHeader,
  PopoverBody,
  Tooltip,
  Table,
  CardFooter
} from 'reactstrap';
import { Link } from 'react-router-dom';
import moment from 'moment'
import _ from 'lodash'
import axios from 'axios';
import cookie from 'react-cookies'
import './Exercise.css'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

class Exercise extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.courseId = this.props.match.params.id;
    this.groupId = this.props.match.params.groupId
    this.state = {
      popoverOpens: {},
      tooltipOpens: {},
      role: 0,
      exercises: [],
      card3: false
    };
    this.toggle = this.toggle.bind(this)
  }

  toggle(id) {
    console.log(id)
    var popoverOpens = { ...this.state.popoverOpens }
    popoverOpens[id] = !this.state.popoverOpens[id]
    this.setState({ popoverOpens });
  }

  tooltipToggle(id) {
    console.log(id)
    var tooltipOpens = { ...this.state.tooltipOpens }
    tooltipOpens[id] = !this.state.tooltipOpens[id]
    this.setState({ tooltipOpens });
  }

  async componentDidMount() {
    try {
      let authen = await this.checkPermission();
      this.setState({ role: authen.role });
      let exercises = await this.getExercises();
      this.setState({ exercises: exercises });
      if (exercises && exercises.lenght > 0) {
        exercises.forEach(x => {
          let popoverOpens = { ...this.state.popoverOpens }
          popoverOpens[x] = false;
          this.setState({ popoverOpens })
          let tooltipOpens = { ...this.state.tooltipOpens }
          tooltipOpens[x] = false;
          this.setState({ tooltipOpens })
        })
      }
    }
    catch (error) {
      console.log(error)
    }

  }

  async getExercises() {
    try {
      let response = await axios.get(`${this.apiBaseUrl}courses/${this.courseId}/exercises`, { headers: { "Authorization": `Bearer ${this.token}` } });
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
    return this.props.history.push(`/courses/${this.courseId}/exercises/create`);
  }

  handleEditClick(event, id) {
    return this.props.history.push(`/courses/${this.courseId}/exercises/update/${id}`);
  }

  handleRemoveClick(event, id) {
    this.toggle(id)
  }

  handleResultClick(event, id) {
    return this.props.history.push(`/courses/${this.courseId}/exercises/result/${id}`);
  }

  handlePermissionAllClick(event, id) {
    return this.props.history.push({ pathname: `/courses/${this.courseId}/exercises/${id}/questions/permissions`, state: { courseId: this.courseId } });
  }

  handleTooltipMO(event, id) {
    this.tooltipToggle(id)
  }

  handleBackClick(event) {
    return this.props.history.push(`/courses`);
  }

  async handleDeleteClick(event, exercise_id) {
    try {
      let response = await axios.delete(this.apiBaseUrl + `courses/${this.courseId}/exercises/${exercise_id}`, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        // return window.location.reload(); 
        let exercises = await this.getExercises();
        this.setState({ exercises: exercises });
        if (exercises && exercises.lenght > 0) {
          exercises.forEach(x => {
            var popoverOpens = { ...this.state.popoverOpens }
            popoverOpens[x] = false;
            this.setState({ popoverOpens })
          })
        }
      }
    }
    catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.code !== 200) {
        return NotificationManager.error(error.response.data.msg, 'Error!', 5000);
      }
      return NotificationManager.error("Something went wrong", 'Error!', 5000);
    };
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  genStudentExercises = () => {
    let group = [];
    if (!this.state.exercises || this.state.exercises.length <= 0) return []
    this.state.exercises.forEach((element, index) => {
      let startTime = ''
      let endTime = ''
      if (element.number_questions && _.get(element, 'questions[0]') && _.get(element, 'questions[0].limit')) {
        let limit = _.get(element, 'questions[0].limit')
        if (moment(limit.start).isValid() && moment(limit.end).isValid()) {
          let stillUtc = moment.utc(limit.start).toDate()
          startTime = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss')
          stillUtc = moment.utc(limit.end).toDate()
          endTime = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss')
        }
      }
      group.push(
        <tr key={index}>
          <td>{index + 1}</td>
          <td title={element.description}><Link to={`/courses/${this.courseId}/exercises/${element.id}/questions`}>{element.name}</Link></td>
          <td>{element.number_questions !== 0 && startTime ? startTime : ''}</td>
          <td>{element.number_questions !== 0 && endTime ? endTime : ''}</td>
          <td>{element.number_questions || 0}</td>
          <td>{element.countSubmited || 0}</td>
          <td>{element.countGraded || 0}</td>
          <td>
            <i id={'Tooltip-' + element.id} className="fa fa-list-alt btn-link icon_handle_exercise" onClick={event => this.handleResultClick(event, element.id)} onMouseEnter={event => this.handleTooltipMO(event, element.id)} onMouseLeave={event => this.handleTooltipMO(event, element.id)}></i>
            <Tooltip isOpen={this.state.tooltipOpens[element.id]} target={'Tooltip-' + element.id} toggle={this.toggleTooltip}>
              Exercise result
            </Tooltip>
          </td>
        </tr>
      )
    });
    return group;
  }

  genTeacherExercises = () => {
    let group = [];
    if (!this.state.exercises || this.state.exercises.length <= 0) return []
    this.state.exercises.forEach((element, index) => {
      if (this.groupId) {
        group.push(
          <tr key={index}>
            <td>{index + 1}</td>
            <td title={element.description}>
              <Link to={`/courses/${this.courseId}/groups/${this.groupId}/exercises/${element.id}/permissions`}>{element.name}</Link>
            </td>
          </tr>
        )
      } else {
        group.push(
          <tr key={index}>
            <td>{index + 1}</td>
            <td title={element.description}><Link to={`/courses/${this.courseId}/exercises/${element.id}/questions`}>{element.name}</Link></td>
            <td>
              <i title={'Edit'} className="fa fa-edit btn-link icon_handle_exercise" onClick={event => this.handleEditClick(event, element.id)}></i>
              <i title={'Result of exercise'} className="fa fa-list-alt btn-link icon_handle_exercise" onClick={event => this.handleResultClick(event, element.id)}></i>
              <i title={'Assign of exercise'} className="fa fa-flag btn-link icon_handle_exercise" onClick={event => this.handlePermissionAllClick(event, element.id)}></i>
              <i title={'Delete'} className="fa fa-trash-o btn-link icon_handle_exercise" id={`popover_${element.id}`} onClick={event => this.handleRemoveClick(event, element.id)}></i>
              <Popover placement="right" isOpen={this.state.popoverOpens[element.id]} target={`popover_${element.id}`} toggle={this.toggle}>
                <PopoverHeader>Do you want to remove <strong>{element.name}</strong>?</PopoverHeader>
                <PopoverBody>
                  <Button type="text" size="sm" color="danger" onClick={event => this.handleDeleteClick(event, element.id)}><i className="fa fa-dot-circle-o"></i> Remove</Button>
                </PopoverBody>
              </Popover>
            </td>
          </tr>
        )
      }
    });
    return group;
  }

  checkViewRole = () => {
    if (this.state.role === 1) {
      return (
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Exercises</strong>
              </CardHeader>
              <CardBody>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Start Time</th>
                      <th>Expired Time</th>
                      <th>No. of Questions</th>
                      <th>No. of submitted questions</th>
                      <th>No. of graded questions</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.genStudentExercises()}
                  </tbody>
                </Table>
                {/* <Pagination>
                  <PaginationItem disabled><PaginationLink previous tag="button">Prev</PaginationLink></PaginationItem>
                  <PaginationItem active>
                    <PaginationLink tag="button">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem><PaginationLink tag="button">2</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink tag="button">3</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink tag="button">4</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink next tag="button">Next</PaginationLink></PaginationItem>
                </Pagination> */}
              </CardBody>
              <CardFooter>
                <Button type="button" size="sm" color="primary" onClick={event => this.handleBackClick(event)}><i className="fa fa-dot-circle-o"></i> Back</Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      )
    }
    else if (this.state.role === 2 || this.state.role === 3) {
      return (
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Exercises</strong>
              </CardHeader>
              <CardBody>
                <Table responsive striped>
                  <thead>
                    {this.groupId ? <tr>
                      <th>No</th>
                      <th>Name</th>
                    </tr> :
                      <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>Action</th>
                      </tr>
                    }
                  </thead>
                  <tbody>
                    {this.genTeacherExercises()}
                  </tbody>
                </Table>
                {/* <Pagination>
                  <PaginationItem disabled><PaginationLink previous tag="button">Prev</PaginationLink></PaginationItem>
                  <PaginationItem active>
                    <PaginationLink tag="button">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem><PaginationLink tag="button">2</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink tag="button">3</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink tag="button">4</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink next tag="button">Next</PaginationLink></PaginationItem>
                </Pagination> */}
              </CardBody>
              <CardFooter>
                <Button type="button" size="sm" color="primary" onClick={event => this.handleAddClick(event)}><i className="fa fa-dot-circle-o"></i> Add</Button>
                <Button type="button" size="sm" color="primary" onClick={event => this.handleBackClick(event)}><i className="fa fa-dot-circle-o"></i> Back</Button>
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

  render() {
    return (
      <div className="animated fadeIn">
        {this.checkViewRole()}
        <NotificationContainer />
      </div>
    );
  }
}

export default Exercise;
