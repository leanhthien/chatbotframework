import React, { Component } from 'react';
import {
  CardGroup,
  Form,
  FormGroup,
  CardFooter,
  Label,
  Input,
  Button,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody
} from 'reactstrap';
import axios from 'axios';
import cookie from 'react-cookies';
import moment from 'moment'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

class Assignee extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.courseId = this.props.match.params.id;
    this.onCheckboxBtnClick = this.onCheckboxBtnClick.bind(this);
    this.state = {
      course_id: "",
      user_emails: "",
      courses: [],
      emails: [],
      cSelected: [],
    };
  }

  async componentDidMount() {
    try {
      let authen = await this.checkPermission();
      this.setState({ role: authen.role });
      let courses = await this.getCourses()
      let emails = await this.getEmails(this.state.course_id)
      if (courses && courses.length > 1) {
        courses = courses.sort((a, b) => {
          if (a && moment(a.createdAt).isValid() && b && moment(b.createdAt).isValid() &&
            moment(a.createdAt).isAfter(b.createdAt)) {
            return -1
          }
          return 1
        }
        )
      }
      this.setState({
        courses: courses,
        emails: emails
      })
    }
    catch (error) {
      console.log(error)
    }
  }

  onCheckboxBtnClick(selected) {
    const index = this.state.cSelected.indexOf(selected);
    if (index < 0) {
      this.state.cSelected.push(selected);
    } else {
      this.state.cSelected.splice(index, 1);
    }
    this.setState({ cSelected: [...this.state.cSelected] });
  }

  async getCourses() {
    try {
      let response = await axios.get(this.apiBaseUrl + `courses`, { headers: { "Authorization": `Bearer ${this.token}` } })
      if (response.data.data.courses) {
        return response.data.data.courses;
      }
      else {
        return null;
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }
  async handleChooseCourse(event) {
    try {
      let course_id = event.target.value
      if (course_id === 'option') {
        course_id = null
      }
      this.setState({ course_id })
      await this.updateEmail(course_id)
    }
    catch (error) {
      console.log(error);
    }

  }

  async updateEmail(id) {
    let emails = await this.getEmails(id)
    this.setState({ emails })
  }

  async getEmails(course_id) {
    try {
      let response = await axios.get(this.apiBaseUrl + `emails/${course_id || -1}`, { headers: { "Authorization": `Bearer ${this.token}` } })
      let accounts = []
      if (response.data.data) {
        const result = response.data.data
        result.forEach(item => {
          if (item.id) {
            accounts.push({ id: item.id, email: item.email })
          }
        })
        return accounts;
      }
      else {
        return null;
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
      return this.props.history.push("/login");
    }
  }

  async handleClick(event) {
    try {
      if (!this.state.course_id || this.state.course_id === "option") return NotificationManager.warning(`Please choose course`, 'Warning!', 5000);
      if (this.state.cSelected.length === 0) return NotificationManager.warning(`TA 'email can't empty`, 'Warning!', 5000);
      let apiBaseUrl = process.env.REACT_APP_DOMAIN;
      let user_emails = '';
      this.state.emails.forEach((item, index) => {
        if (this.state.cSelected.includes(item.id)) {
          if (user_emails) {
            user_emails += ';'
          }
          user_emails += `${item.email}`
        }
      })
      let payload = {
        "course_id": this.state.course_id,
        "user_emails": user_emails
      }
      let response = await axios.post(apiBaseUrl + `assignees`, payload, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.code === 200) {
        this.updateEmail()
        this.setState({ course_id: '', user_emails: '', cSelected: [] })
        NotificationManager.success("Assigned successfull!", 'Success', 5000)
      }
      else {
        return NotificationManager.error(response.data.msg, 'Error!', 5000);
      }
    }
    catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.code !== 200) {
        return NotificationManager.error(error.response.data.msg, 'Error!', 5000);
      }
      return NotificationManager.error("Something went wrong", 'Error!', 5000);
    }
  }

  genCourses() {
    let courses = []
    courses.push(<option key={'option'} value={undefined}>option</option>)
    if (!this.state.courses || this.state.courses.length <= 0) return courses
    this.state.courses.forEach(course => {
      courses.push(<option key={course.id} value={course.id}>{course.name}</option>)
    })
    return courses
  }

  genAllEmail() {
    if (!this.state.emails || this.state.emails.length <= 0) return []
    return (
      this.state.emails.map((value, index) => {
        return (
          <div key={index} style={{ margin: '5px 12px' }}>
            <Button color="primary" onClick={() => this.onCheckboxBtnClick(value.id)} active={this.state.cSelected.includes(value.id)}>
              <div style={{
                width: '120px', whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis', display: 'inline-block'
              }}>{value.email}</div>
            </Button><br />
          </div>

        )
      })
    )
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    return (
      <div className="animated fadeIn">
        <Row className="justify-content-center">
          <Col>
            <CardGroup>
              <Card>
                <CardHeader>
                  Create asignees
                </CardHeader>
                <CardBody>
                  <Form action="" method="post" className="form-horizontal">
                    <FormGroup row>
                      <Label sm="5" size="sm" htmlFor="input-small">Course</Label>
                      <Col sm="6">
                        {/* <Input bsSize="sm" type="text" id="input-small" name="input-small" className="input-sm" placeholder="ex. 12345" onChange = {event => this.setState({course_id:event.target.value})}/> */}
                        <Input type="select" name="ccmonth" id="ccmonth" value={this.state.course_id} onChange={event => this.handleChooseCourse(event)}>
                          {this.genCourses()}
                        </Input>
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="5" htmlFor="input-normal">TA 'email</Label>
                      <Col sm="6">
                        <Row >
                          {this.genAllEmail()}
                        </Row>
                        {/* <Input type="select" name="ccmonth" id="ccmonth" value={this.state.course_id} onChange={event => this.setState({ course_id: event.target.value })}>
                          {this.genAllEmail()}
                        </Input> */}
                        {/* <Input type="text" id="input-normal" value={this.state.user_emails} name="input-normal" placeholder="ex. ta@gmail.com;ta2@gmail.com" onChange = {event => this.setState({user_emails:event.target.value})}/> */}
                      </Col>
                    </FormGroup>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button type="submit" size="sm" color="primary" onClick={event => this.handleClick(event)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
                  <Button type="reset" size="sm" color="danger"
                    onClick={event => this.setState({ course_id: '', cSelected: [] })}
                  ><i className="fa fa-ban"></i> Reset</Button>
                </CardFooter>
              </Card>
            </CardGroup>
          </Col>
        </Row>
        <NotificationContainer />
      </div>
    );
  }
}

export default Assignee;
