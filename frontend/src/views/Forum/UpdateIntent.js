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
import Swal from 'sweetalert'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

class Forum extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.state = {
      intent: {},
      question: "",
      answer: ""
    };
    this.intentId = this.props.match.params.id;
  }

  async componentDidMount() {
    let authen = await this.checkPermission();
    this.setState({ role: authen.role });

    let intent = await this.getIntent();
    if (intent) {
      this.setState({ question: intent.question, answer: intent.answer});
      this.setState({ intent: intent});
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

  async getIntent() {
    try {
      let response = await axios.get(this.apiBaseUrl + 'forum/' + this.intentId + '/intent', { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return response.data.data;
      }
      else {
        return null;
      }
    }
    catch (error) {
      return null;
    }
  }

  async handleClick(event) {
    try {
      if (!this.state.question) {
        return Swal('Warning!', 'Please fill all fields', 'warning')
      }

      let apiBaseUrl = process.env.REACT_APP_DOMAIN;
      let payload = {
        "answer": this.state.answer,
        "question": this.state.question,
      }
      let response = await axios.put(apiBaseUrl + `forum/${this.intentId}/updateIntent`, payload, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return Swal('Success', '', 'success').then(result => {
          return this.props.history.push(`/forum/intent`);
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

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    return (
      <div className="animated fadeIn">
        <Row className="justify-content-center">
          <Col>
            <CardGroup>
              <Card>
                <CardHeader>
                  Update Intent
                </CardHeader>
                <CardBody>
                  <Form action="" method="post" className="form-horizontal">
                    <FormGroup>
                      <Label htmlFor="input-normal">Question</Label>
                      <Input type="text" id="input-normal" value={this.state.question} name="input-normal" placeholder="Question" onChange={event => this.setState({ question: event.target.value })} />                     
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="input-normal">Answer</Label>
                      <Input type="textarea" id="input-normal" value={this.state.answer} name="input-normal" placeholder="Answer" onChange={event => this.setState({ answer: event.target.value })} />
                    </FormGroup>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button type="submit" size="sm" color="primary" onClick={event => this.handleClick(event)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
                  <Button type="reset" size="sm" color="danger" onClick={(event) => this.setState({ answer: '' })}><i className="fa fa-ban"></i> Reset</Button>
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

export default Forum;
