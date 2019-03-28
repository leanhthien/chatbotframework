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
  ButtonToolbar,
  Popover,
  PopoverHeader,
  PopoverBody,
  Table
} from 'reactstrap';
import axios from 'axios';
import cookie from 'react-cookies';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

class Forum extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
  }

  async componentDidMount() {
    try {
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
      return this.props.history.push("/login");
    }
  }

  handleCreateIssueClick(event) {
    return this.props.history.push("/courses/create");
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  checkViewRole = () => {
    return (
      <ButtonToolbar>
        <Button type="submit" color="success" onClick={event => this.handleCreateIssueClick(event)}><i className="fa fa-dot-circle-o"></i> Issue </Button>
        <Button type="submit" color="warning" onClick={event => this.handleReplyIssueClick(event)}><i className="fa fa-dot-circle-o"></i> Reply Issue</Button>
        <Button type="submit" color="danger" onClick={event => this.handleIntentClick(event)}><i className="fa fa-dot-circle-o"></i> Intent </Button>
      </ButtonToolbar>
    )
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
