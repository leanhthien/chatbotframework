import React, { Component } from 'react';
import { Button, Card, CardBody, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import axios from 'axios';
import cookie from 'react-cookies';
import AlertService from '../../services/AlertService';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
class Register extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.state = {
      username: '',
      email: '',
      fullname: '',
      role: '',
      resForm: {
        msg: '',
        hasError: false
      }
    }
  }

  async handleClick(event) {
    try {
      const { email, fullname, username, resForm, role } = this.state
      if (!email || !fullname || !username || !role || role === "role") {
        return NotificationManager.warning('Please fill all fields', 'Warning', 5000);
      }
      if (!email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
        return NotificationManager.warning('Email is not valid', 'Warning', 5000);
      }
      let apiBaseUrl = process.env.REACT_APP_DOMAIN;
      let payload = {
        "username": this.state.username,
        "fullname": this.state.fullname,
        "email": this.state.email,
        "role": this.state.role,
      }
      AlertService.loadingPopup()
      let response = await axios.post(apiBaseUrl + 'register/ta', payload, { headers: { "Authorization": `Bearer ${this.token}` } });
      AlertService.swal.close()
      if (response.data.code === 200) {
        NotificationManager.success(response.data.msg, 'Success', 5000)
        this.setState({
          username: '',
          email: '',
          fullname: '',
          role: "role",
          resForm: {
            hasError: false
          }
        })

      }
      else {
        resForm.hasError = true;
        resForm.msg = response.data.msg;
        this.setState({
          resForm: resForm,
        });
      }
    }
    catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.code !== 200) {
        AlertService.swal.close()
        return NotificationManager.error(error.response.data.msg, 'Error!', 5000);
      }
      AlertService.swal.close()
      return NotificationManager.error("Something went wrong", 'Error!', 5000);
    }
  }
  genRole() {
    let Role = [];
    let roles = [{ id: 0, name: 'role' },{ id: 1, name: 'student' }, { id: 2, name: 'teacher' }, { id: 3, name: 'admin' }]
    roles.forEach(element => {
      Role.push(<option key={element.id} value={element.id}>{element.name}</option>)
    });
    return Role;
  }
  genUsername() {
    if (this.state.role === 1) {
      return <Input type="text" placeholder="Ma so sinh vien" autoComplete="username" onChange={event => this.setState({ username: event.target.value })} />
    }
    else {
      return <Input type="text" placeholder="Ma so can bo" autoComplete="username" onChange={event => this.setState({ username: event.target.value })} value={this.state.username} />
    }
  }
  renderErrorRegister() {
    if (this.state.resForm.hasError) {
      return (
        <div className="alert alert-danger">
          <button type="button" className="close" data-dismiss="alert" aria-hidden="true">&times;</button>
          <strong>Error!</strong> {this.state.resForm.msg}
        </div>);
    } else {
      return;
    }
  }
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="9" lg="7" xl="6">
              <Card className="mx-4">
                <CardBody className="p-4">
                  {this.renderErrorRegister()}
                  <Form>
                    <h1>Register</h1>
                    <p className="text-muted">Create your account</p>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      {this.genUsername()}
                    </InputGroup>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Ho va ten" autoComplete="fullname" onChange={event => this.setState({ fullname: event.target.value })} value={this.state.fullname} />
                    </InputGroup>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>@</InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Email" autoComplete="email" onChange={event => this.setState({ email: event.target.value })} value={this.state.email} />
                    </InputGroup>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-disc"></i>
                        </InputGroupText>
                      </InputGroupAddon>

                      <Input type="select" name="ccmonth" value={this.state.role} id="ccmonth" onChange={event => this.setState({ role: event.target.value })}>
                        {this.genRole()}
                      </Input>
                    </InputGroup>
                    {/*   <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="Repeat password" autoComplete="new-password" onChange = {event => this.setState({repassword:event.target.value})}/>
                    </InputGroup> */}

                    <Button color="success" block onClick={event => this.handleClick(event)}>Create Account</Button>
                  </Form>
                </CardBody>
                {/* <CardFooter className="p-4">
                  <Row>
                    <Col xs="12" sm="6">
                      <Button className="btn-facebook mb-1" block><span>facebook</span></Button>
                    </Col>
                    <Col xs="12" sm="6">
                      <Button className="btn-twitter mb-1" block><span>twitter</span></Button>
                    </Col>
                  </Row>
                </CardFooter> */}
              </Card>
            </Col>
          </Row>
        </Container>
        <NotificationContainer />
      </div>
    );
  }
}

export default Register;
