import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Popover,
  PopoverHeader,
  PopoverBody,
  Table
} from 'reactstrap';
import axios from 'axios';
import cookie from 'react-cookies';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

class Course extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.toggle = this.toggle.bind(this);
    this.state = {
      popoverOpens: {},
      role: 0,
      courses: []
    };
    this.toggle = this.toggle.bind(this)
  }

  toggle(id) {
    var popoverOpens = { ...this.state.popoverOpens }
    popoverOpens[id] = !this.state.popoverOpens[id]
    this.setState({ popoverOpens });
  }

  async componentDidMount() {
    try {
      let authen = await this.checkPermission();
      this.setState({ role: authen.role });
      let courses = await this.getCourses();
      this.setState({ courses: courses });
      if (courses) {
        courses.forEach(x => {
          var popoverOpens = { ...this.state.popoverOpens }
          popoverOpens[x] = false;
          this.setState({ popoverOpens })
        })
      }

    }
    catch (error) {
      console.log(error)
    }
  }

  async getCourses() {
    try {
      let response = await axios.get(this.apiBaseUrl + 'courses', { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data.courses) {
        return response.data.data.courses;
      }
      else {
        return null;
      }
    }
    catch (error) {
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
      return this.props.history.push("/login");
    }
  }

  handleAddClick(event) {
    return this.props.history.push("/courses/create");
  }

  handleEditClick(event, id) {
    return this.props.history.push(`/courses/update/${id}`);
  }

  handleRemoveClick(event, id) {
    this.toggle(id)
  }

  async handleDeleteClick(event, id) {
    try {
      let response = await axios.delete(this.apiBaseUrl + 'courses/' + id, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response && response.data && response.data.code === 200) {
        return window.location.reload();
      }
      return NotificationManager.error(response.data.msg || '', 'Error!', 5000);
    }
    catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.code !== 200) {
        return NotificationManager.error(error.response.data.msg || '', 'Error!', 5000);
      }
      return NotificationManager.error("Something went wrong", 'Error!', 5000);
    };
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>
  genStudentTACourses = () => {
    let group = [];
    if (!this.state.courses || this.state.courses.length <= 0) return group
    // TA
    if (this.state.role === 2) {
      this.state.courses.forEach((element, index) => {
        group.push(
          <tr key={index}>
            <td>{index + 1}</td>
            <td title={element.description}><Link className="card-headelement.ider-action btn-setting btn btn-link" to={`/courses/${element.id}/teacher`}>{element.name}</Link></td>
          </tr>
        )
      })
    }
    // student
    else if (this.state.role === 1) {
      this.state.courses.forEach((element, index) => {
        group.push(
          <tr key={index}>
            <td>{index + 1}</td>
            <td title={element.description}><Link className="card-headelement.ider-action btn-setting btn btn-link" to={`/courses/${element.id}/exercises`}>{element.name}</Link></td>
          </tr>
        )
      })
    }
    return group
  }

  genAdminCourse = () => {
    let group = [];
    if (!this.state.courses || this.state.courses.length <= 0) return group
    this.state.courses.forEach((element, index) => {
      group.push(
        <tr key={element.id}>
          <td>{index + 1}</td>
          <td title={element.description}><Link className="card-headelement.ider-action btn-setting btn btn-link" to={`/courses/${element.id}/teacher`}>{element.name}</Link></td>
          <td>
            <button className="card-heelement.idader-action btn-setting btn btn-link"><i className="fa fa-edit" title='Edit course' onClick={event => this.handleEditClick(event, element.id)}></i></button>
            <button className="card-heelement.idader-action btn-setting btn btn-link" id={`popover_${element.id}`} title='Remove course' onClick={event => this.handleRemoveClick(event, element.id)}><i className="fa fa-trash-o"></i></button>
            <Popover placement="right" isOpen={this.state.popoverOpens[element.id]} target={`popover_${element.id}`} toggle={this.toggle}>
              <PopoverHeader>Do you want to remove <strong>{element.name}</strong>?</PopoverHeader>
              <PopoverBody>
                <Button type="text" size="sm" color="danger" onClick={event => this.handleDeleteClick(event, element.id)}><i className="fa fa-dot-circle-o"></i> Remove</Button>
              </PopoverBody>
            </Popover>
          </td>
        </tr>
      )
    })
    return group
  }

  checkViewRole = () => {
    if (this.state.role === 2 || this.state.role === 1) {
      return (
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Courses</strong>
              </CardHeader>
              <CardBody>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.genStudentTACourses()}
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
            </Card>
          </Col>
        </Row>
      )
    }
    else if (this.state.role === 3) {
      return (
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Courses</strong>
              </CardHeader>
              <CardBody>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.genAdminCourse()}
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

  render() {
    return (
      <div className="animated fadeIn">
        {this.checkViewRole()}
        <NotificationContainer />
      </div>
    );
  }
}

export default Course;
