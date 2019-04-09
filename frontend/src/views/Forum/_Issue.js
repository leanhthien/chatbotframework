import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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
  CardBody,
  Table
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
      popoverOpens: {},
      role: 0,
      question: "",
      issues: []
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

      let issues = await this.getAllIssues();
      this.setState({ issues: issues });

      if (issues) {
        console.log(issues);
        issues.forEach(x => {
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

  async getAllIssues() {
    try {
      let response = await axios.get(this.apiBaseUrl + 'forum/allIssues', { headers: { "Authorization": `Bearer ${this.token}` } });
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
      if (!this.state.question) {
        return
      }
      let apiBaseUrl = process.env.REACT_APP_DOMAIN;
      let payload = {
        "question": this.state.question,
      }
      let response = await axios.post(apiBaseUrl + `forum/createIssue`, payload, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return Swal('Success', '', 'success').then(result => {
          return this.props.history.push(`/forum/createIssue`);
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

  genIssuesHistory = () => {
    let history = [];
    if (!this.state.issues || this.state.issues.length <= 0) return history
  
    this.state.issues.forEach((element, index) => {
      history.push(
        <tr key={index}>
          <td>{index + 1}</td>
          <td title={element.question}><Link className="card-headelement.ider-action btn-setting btn btn-link" to={`/forum/${element.id}/replyIssue`}>{element.question}</Link></td>
          <td title={element.answer}><Link className="card-headelement.ider-action btn-setting btn btn-link" to={`/forum/${element.id}/replyIssue`}>{element.answer}</Link></td>
        </tr>
      )
    })
    return history
  }

  checkViewRole = () => {
    return (
            <Row className="justify-content-center">
              <Col>
                <CardGroup>
                  <Card>
                    <CardHeader>
                      Submit issues
                    </CardHeader>
                    <CardBody>
                      <Row>
                        <Col sm="12" xl="12">
                          <Card>
                            <CardHeader>
                              <i className="fa fa-align-justify"></i><strong>Issues</strong>
                            </CardHeader>
                            <CardBody>
                              <Table responsive striped>
                                <thead>
                                  <tr>
                                    <th>No</th>
                                    <th>Question</th>
                                    <th>Answer</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {this.genIssuesHistory()}
                                </tbody>
                              </Table>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                
                      <Form action="" method="post" className="form-horizontal">
                        <FormGroup row>
                          <Col>
                            <Input sm="10" type="text" id="input-normal" value={this.state.question} name="input-normal" placeholder="Question" onChange={event => this.setState({ question: event.target.value })} />                  
                          </Col>
                          
                        </FormGroup>
                      </Form>
                    </CardBody>
                    <CardFooter>
                    <Button sm="2" type="submit" size="sm" color="primary" onClick={event => this.handleClick(event)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
                    </CardFooter>

                  </Card>
                </CardGroup>
              </Col>
            </Row>
        );
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

export default Forum;
