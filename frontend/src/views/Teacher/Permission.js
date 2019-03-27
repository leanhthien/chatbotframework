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
import moment from 'moment'
import axios from 'axios';
import swal from 'sweetalert'
import cookie from 'react-cookies';
import _ from 'lodash'
import './Permission.css'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

class Permission extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.questionId = this.props.match.params.id;
    this.token = cookie.load('user_token');
    this.state = {
      courseId: _.get(this.props, 'location.state.courseId', null),
      groupId: null,
      groups: [],
      startTime: moment().format('YYYY-MM-DDTHH:mm'),
      endTime: moment().format('YYYY-MM-DDTHH:mm')
    };
    this.handleChange = this.handleChange.bind(this)
  }

  async componentDidMount() {
    try {
      let authen = await this.checkPermission();
      this.setState({ role: authen.role });
      let groups = await this.getGroups();
      this.setState({ groups: groups });
    } catch (error) {
      console.log(error)
    }

  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value })
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

  async handleClick(event) {
    try {
      const { startTime, endTime } = this.state
      if (!moment(startTime).isValid() || !moment(endTime).isValid()) {
        return NotificationManager.warning('Start Time and End Time is Invalid', 'Warning!', 5000);
      }
      if (startTime && endTime && moment(endTime).subtract(1, 'minute').isBefore(startTime)) {
        return NotificationManager.warning('End time must be greater than start time', 'Warning!', 5000);
      }
      let apiBaseUrl = process.env.REACT_APP_DOMAIN;
      let payload = {
        "questionIds": this.questionId,
        "group_id": this.state.groupId,
        startTime: moment(startTime).utc(),
        endTime: moment(endTime).utc()
      }
      let response = await axios.post(apiBaseUrl+`permission/create`, payload,  { headers: {"Authorization" : `Bearer ${this.token}`} });
      if(response.data.data && response.data.code === 200){
        swal('Success!', '', 'success').then(result => {
          if (result) {
            return this.props.history.goBack();  
          }
        })           
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

  async getGroups() {
    try {
      let courseId = this.state.courseId || _.get(this.props, 'location.state.courseId', null)
      if (!courseId) swal('Error', `Don't have courseId`, 'error')
      let response = await axios.get(this.apiBaseUrl+`/courses/${this.state.courseId}/groups/questions/${this.questionId}`,  { headers: {"Authorization" : `Bearer ${this.token}`} });
      if(response.data.code === 200 && response.data.data){
        return response.data.data;       
      }      
      else{
        return null;
      }
    }
    catch (error) {
      console.log(error);
      return null;
    }
  }

  genGroup = () => {
    let group = [];
    group.push(<option key='option'>option</option>)
    if (!this.state.groups || this.state.groups.length <= 0) return group
    this.state.groups.forEach(element => {
      group.push(<option key={element.id} value={element.id}>{element.name}</option>)
    });
    return group;
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    let { startTime, endTime } = this.state
    return (
      <div className="animated fadeIn">
        <Row className="justify-content-center">
          <Col>
            <CardGroup>
              <Card>
                <CardHeader>
                  Assign questions to group
                </CardHeader>
                <CardBody>
                  <Form action="" method="post" className="form-horizontal">
                    <FormGroup>
                      <Label htmlFor="ccmonth">Groups</Label>
                      <Input type="select" name="ccmonth" id="ccmonth" onChange={event => this.setState({ groupId: event.target.value })}>
                        {this.genGroup()}
                      </Input>
                    </FormGroup>
                  </Form>
                  <Form>
                    <Row form>
                      <Col md={4}>
                        <FormGroup>
                          <Label for="exampleDate">Start Time</Label>
                          <input
                            className='permistion-input-date'
                            type="datetime-local"
                            name="date"
                            id="exampleDate"
                            min={moment().format('YYYY-MM-DDTHH:mm')}
                            value={startTime}
                            onChange={event => this.handleChange('startTime', event.target.value)}
                            placeholder="date placeholder"
                          />
                        </FormGroup>
                      </Col>
                      <Col md={1}></Col>
                      <Col md={4}>
                        <FormGroup>
                          <FormGroup>
                            <Label for="exampleTime">End Time</Label>
                            <input
                              className='permistion-input-date'
                              type="datetime-local"
                              name="time"
                              id="exampleTime"
                              min={moment(startTime).format('YYYY-MM-DDTHH:mm') || moment().format('YYYY-MM-DDTHH:mm')}
                              value={endTime}
                              onChange={event => this.handleChange('endTime', event.target.value)}
                              placeholder="time placeholder"
                            />
                          </FormGroup>
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button disabled={!this.state.groupId || this.state.groupId === 'option'} type="submit" size="sm" color="primary" onClick={event => this.handleClick(event)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
                  <Button type="reset" size="sm" color="danger"><i className="fa fa-ban"></i> Reset</Button>
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

export default Permission;
