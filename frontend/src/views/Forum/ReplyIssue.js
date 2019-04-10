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
  CardText,
  CardBody, 
  CardTitle,
  CardSubtitle,
  Badge,
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
      issue: {},
      issueOwner: "",
      question: "",
      answer: ""
    };
    this.issueId = this.props.match.params.id;
  }

  async componentDidMount() {
    let authen = await this.checkPermission();
    this.setState({ role: authen.role });

    let issue = await this.getIssue();
    if (issue) {
      this.setState({ issueOwner: issue.username });
      this.setState({ question: issue.question });
      this.setState({ issue: issue });
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

  async getIssue() {
    try {
      let response = await axios.get(this.apiBaseUrl + 'forum/' + this.issueId + '/issue', { headers: { "Authorization": `Bearer ${this.token}` } });
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
      if (!this.state.answer) {
        return Swal('Warning!', 'Please fill all fields', 'warning')
      }
      let apiBaseUrl = process.env.REACT_APP_DOMAIN;
      let payload = {
        "answer": this.state.answer,
      }
      let response = await axios.post(apiBaseUrl + `forum/${this.issueId}/createReply`, payload, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return Swal('Success', '', 'success').then(result => {
          return this.props.history.push(`/forum/${this.issueId}/replyIssue`);
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

  genListReplies = () => {
    let history = [];
    if (!this.state.issue.replies || this.state.issue.replies.length <= 0) return history
  
    this.state.issue.replies.forEach((element, index) => {
      let head = element.username + " • " + element.updatedAt;
      history.push(
      
        <tr key={index}>
          <td>           
            <CardSubtitle className="mb-2 text-muted">{head}</CardSubtitle>                          
            <CardText>{element.answer}</CardText>     
          </td>          
        </tr>
      )
    })
    return history
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
                <CardSubtitle className="mb-2 text-muted"><Badge variant="secondary">{this.state.issueOwner}</Badge></CardSubtitle>
                <CardTitle>{this.state.question}</CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col sm="11"></Col>
                    <CardSubtitle className="mb-2 text-muted">ALL REPLIES</CardSubtitle>
                  </Row>
                  
                    <Table>                 
                    <tbody>
                      {this.genListReplies()}
                    </tbody>                   
                  </Table> 
                                                  
                </CardBody>
                <CardFooter>
                  <Form action="" method="post" className="form-horizontal">
                    <FormGroup>
                      <Input type="textarea" id="input-normal" value={this.state.answer} name="input-normal" placeholder="Reply" onChange={event => this.setState({ answer: event.target.value })} />
                    </FormGroup>
                  </Form>
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
