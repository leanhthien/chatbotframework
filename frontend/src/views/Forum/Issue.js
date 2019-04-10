import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  CardGroup,
  FormGroup,
  Button,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardSubtitle,
  Badge
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
    return this.props.history.push("/forum/createIssue");
  }

  
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  genIssuesHistory = () => {
    let listIssue = [];
    if (!this.state.issues) return listIssue

    if (this.state.issues.length <= 0) {
      listIssue.push(
        
  

      )
    }
    else {
      this.state.issues.forEach((element, index) => {

        // let last_access = new Intl.DateTimeFormat('en-US').format(element.updatedAt)
  
        listIssue.push(
        
            <Card>     
              <CardBody>
                <CardSubtitle className="mb-2 text-muted"><Badge variant="secondary">{element.username}</Badge></CardSubtitle>
                <CardTitle><Link to={`/forum/${element.id}/replyIssue`}>{element.question}</Link></CardTitle> 
                <Row>
                  <Col></Col>
                  <Col xs lg="2">
                  <CardSubtitle className="mb-2 text-muted">{element.updatedAt}</CardSubtitle>
                  </Col>
                </Row>           
              </CardBody>
            </Card>
  
        )
      })
    }
  
    return listIssue
  }

  checkViewRole = () => {
    return (
            <Row className="justify-content-center">
              <Col>
                <CardGroup>
                  <Card>
                    <CardHeader>
                    <strong>Issues</strong>
                    </CardHeader>
                    <CardBody>
                      <FormGroup>
                      <Row>  
                      <Col></Col>
                      <Col xs lg="2">              
                        <Button sm="2" type="submit" size="sm" color="primary" onClick={event => this.handleClick(event)}><i className="fa fa-dot-circle-o"></i> Create an Issue</Button>                           
                      </Col>
                      </Row>
                      </FormGroup>                      
                      {this.genIssuesHistory()}
                    </CardBody>
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
