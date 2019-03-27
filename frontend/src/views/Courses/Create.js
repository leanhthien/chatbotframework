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
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';


class Course extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');

    this.state = {
      code: "",
      name: ""
    };
  }

  async componentDidMount() {
    let authen = await this.checkPermission();
    this.setState({ role: authen.role });
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
      if (!this.state.name || !this.state.code) {
        return NotificationManager.warning('Please fill all fields', 'Warning!', 5000);

      }
      let apiBaseUrl = process.env.REACT_APP_DOMAIN;
      let payload = {
        "code": this.state.code,
        "name": this.state.name,
        "description": this.state.description
      }
      let response = await axios.post(apiBaseUrl + 'courses', payload, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response && response.data && response.data.code === 200) {
        return this.props.history.push("/courses");
      }
      return NotificationManager.error(response.data.msg, 'Error!', 5000);

    }
    catch (error) {
      console.log(error);
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
        <Row className="justify-content-center">
          <Col>
            <CardGroup>
              <Card>
                <CardHeader>
                  Create a course
                </CardHeader>
                <CardBody>
                  <Form action="" method="post" className="form-horizontal">
                    <FormGroup row>
                      <Label sm="5" size="sm" htmlFor="input-small">Code</Label>
                      <Col sm="6">
                        <Input bsSize="sm" type="text" value={this.state.code} id="input-small" name="input-small" className="input-sm" placeholder="ex. 1" onChange={event => this.setState({ code: event.target.value })} />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="5" htmlFor="input-normal">Name</Label>
                      <Col sm="6">
                        <Input type="text" id="input-normal" value={this.state.name} name="input-normal" placeholder="ex. Course 1" onChange={event => this.setState({ name: event.target.value })} />
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

export default Course;
