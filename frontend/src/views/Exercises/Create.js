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
import _ from 'lodash'
import cookie from 'react-cookies';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

class Exercise extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.state = {
      code: "",
      name: "",
      courseId: '',
      description: ''
    };
  }

  async componentDidMount() {
    try {
      this.setState({ courseId: _.get(this.props, 'match.params.id') })
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

  async handleClick(event) {
    try {
      let { courseId = _.get(this.props, 'match.params.id') } = this.state
      if (!this.state.name || !this.state.code) {
        return NotificationManager.warning('Please fills all fields', 'Warning!', 5000);
      }
      let apiBaseUrl = process.env.REACT_APP_DOMAIN;
      let payload = {
        "code": this.state.code,
        "name": this.state.name,
        "description": this.state.description
      }
      let response = await axios.post(apiBaseUrl + `courses/${courseId}/exercises`, payload, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return this.props.history.push(`/courses/${courseId}/exercises`);
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

  handleBackClick(event) {
    let courseId = _.get(this.props, 'match.params.id')
    return this.props.history.push(`/courses/${courseId}/exercises`);
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
                  Create a exercise
                </CardHeader>
                <CardBody>
                  <Form action="" method="post" className="form-horizontal">
                    <FormGroup row>
                      <Label sm="5" size="sm" htmlFor="input-small">Code</Label>
                      <Col sm="6">
                        <Input bsSize="sm" type="text" id="input-small" value={this.state.code} name="input-small" className="input-sm" placeholder="1" onChange={event => this.setState({ code: event.target.value })} />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="5" htmlFor="input-normal">Name</Label>
                      <Col sm="6">
                        <Input type="text" id="input-normal" value={this.state.name} name="input-normal" placeholder="Ex. Exercise 1" onChange={event => this.setState({ name: event.target.value })} />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="5" htmlFor="input-normal">Description</Label>
                      <Col sm="6">
                        <Input type="textarea" id="input-normal" value={this.state.description} name="input-normal" placeholder="Description" onChange={event => this.setState({ description: event.target.value })} />
                      </Col>
                    </FormGroup>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button type="submit" size="sm" color="primary" onClick={event => this.handleClick(event)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
                  <Button type="reset" size="sm" color="danger" onClick={event => this.setState({ code: '', name: '' })}><i className="fa fa-ban"></i> Reset</Button>
                  <Button type="button" size="sm" color="primary" onClick={event => this.handleBackClick(event)}><i className="fa fa-dot-circle-o"></i> Back</Button>
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

export default Exercise;
