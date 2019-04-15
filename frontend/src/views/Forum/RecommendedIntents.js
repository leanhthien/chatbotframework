import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  CardFooter,
  Button,
  Table
} from 'reactstrap';
import axios from 'axios';
import cookie from 'react-cookies';
import Swal from 'sweetalert';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

class Intent extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.toggle = this.toggle.bind(this);
    this.state = {
      popoverOpens: {},
      role: 0,
      question: '',
      intents: []
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
      let intents = await this.getRecommendedIntents();
      this.setState({ intents: intents });
      if (intents) {
        intents.forEach(x => {
          var popoverOpens = { ...this.state.popoverOpens }
          popoverOpens[x] = false;
          this.setState({ popoverOpens })
        })
      }
      if (this.props.location.state.question) {
        this.setState({question : this.props.location.state.question})
      }

    }
    catch (error) {
      console.log(error)
    }
  }

  async getRecommendedIntents() {
    try {
      let response = await axios.get(this.apiBaseUrl + 'forum/recommendedIntents', { headers: { "Authorization": `Bearer ${this.token}` } });
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
      return this.props.history.push("/login");
    }
  }

  async handleClick(event) {
    try {
      if (!this.state.question) {
        return Swal('Warning!', 'Please fill all fields', 'warning')
      }
      let apiBaseUrl = process.env.REACT_APP_DOMAIN;
      let payload = {
        "question": this.state.question,
      }
      let response = await axios.post(apiBaseUrl + `forum/createIssue`, payload, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return Swal('Success', '', 'success').then(result => {
          return this.props.history.push(`/forum/issue`);
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

  genRecommendedIntents = () => {
    let group = [];
    if (!this.state.intents || this.state.intents.length <= 0) return group
    this.state.intents.forEach((element, index) => {
      group.push(
        <tr key={element.id}>
          <td title={element.description}><Link className="card-headelement.ider-action btn-setting btn btn-link" to={``}>{element.question}</Link></td>
        </tr>
      )
    })
    return group
  }

  checkViewRole = () => {
    
      return (
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <strong>Recommended Intents</strong>
              </CardHeader>
              <CardBody>
                <CardTitle>{this.state.question}</CardTitle>
                <CardText>Are these below issues relevant to your problem?</CardText>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>Question</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.genRecommendedIntents()}
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
                <CardText>None of those reach the problem? Submit your issue.</CardText>
                <Button sm="2" type="submit" size="sm" color="primary" onClick={event => this.handleClick(event)}><i className="fa fa-dot-circle-o"></i> Submit </Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
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

export default Intent;
