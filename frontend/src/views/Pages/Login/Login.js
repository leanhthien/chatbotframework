import React, { Component } from 'react';
import {
  Button, Card, CardBody, CardGroup, Col,
  Container, Form, Input, InputGroup,
  InputGroupAddon, InputGroupText, Row
} from 'reactstrap';
import axios from 'axios';
import cookie from 'react-cookies'
import { Link } from 'react-router-dom';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import './Login.css'
import Recaptcha from 'react-recaptcha'
let recaptchaInstance;
// create a reset function
const resetRecaptcha = () => {
  recaptchaInstance.reset();
};
class Login extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.reCaptchaLoaded = this.reCaptchaLoaded.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this)
    this.state = {
      email: '',
      password: '',
      formErrors: { email: '', password: '' },
      errLogin: false,
      msg: '',
      isVerified: false,
      tokenRecaptcha: '',
    }
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
  }

  async componentDidMount() {
    if (cookie.load('user_fullname') && cookie.load('user_email') && cookie.load('user_role') && cookie.load('user_token')) {
      try {
        this.token = cookie.load('user_token');
        let response = await axios.get(`${this.apiBaseUrl}token`, { headers: { "Authorization": `Bearer ${this.token}` } });
        if (response.data.auth === true) {
          return this.props.history.push("/dashboard");
        }
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  onChangeEmail = (e) => {
    this.setState({ email: e.target.value })
    this.validateField('email', e.target.value)
  }

  onChangePassword = (e) => {
    this.setState({ password: e.target.value })
    this.validateField('password', e.target.value)
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let emailValid = this.state.email;
    let passwordValid = this.state.password;

    switch (fieldName) {
      case 'email':
        emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        fieldValidationErrors.email = emailValid ? '' : ' Invalid email';
        break;
      case 'password':
        passwordValid = value.length >= 6;
        fieldValidationErrors.password = passwordValid ? '' : 'Password at least 6 characters';
        break;
      default:
        break;
    }
  }
  reCaptchaLoaded() {
    // console.log("capcha have successful loaded")
  }

  verifyCallback(response) {
    if (response) {
      this.setState({
        isVerified: true,
        tokenRecaptcha: response
      })
    }

  };

  async handleClick(event) {
    try {
      if (!this.state.isVerified && process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
        return NotificationManager.error('Please select captcha', 'Error!', 5000);
      }

      const { formErrors } = this.state;
      if (formErrors.email === '' && formErrors.password === '') {
        let payload = {
          "email": this.state.email.toLowerCase(),
          "password": this.state.password,
          "captcha": this.state.tokenRecaptcha,
        }
        let response = await axios.post(this.apiBaseUrl + 'login', payload);
        if (response && response.data && response.data.code !== 200) {
          if (process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
            resetRecaptcha()
          }
          this.setState({ errLogin: true, msg: response.data.msg })
        }
        else {
          await cookie.save('user_fullname', response.data.data.fullname, { path: '/' });
          await cookie.save('user_role', response.data.data.role, { path: '/' });
          await cookie.save('user_email', response.data.data.email, { path: '/' });
          await cookie.save('user_token', response.data.data.token, { path: '/' });
          return this.props.history.push("/dashboard");
        }
      }
    }
    catch (error) {
      if (error && error.response && error.response.data && error.response.data.code !== 200) {
        if (process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
          resetRecaptcha()
        }
        this.setState({ errLogin: true, msg: error.response.data.msg, })
      }
      else {
        if (process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
          resetRecaptcha()
        }
        this.setState({ errLogin: true, msg: "Something went wrong, please try again" })
      }
      console.log(error)

    };
  }
  
  renderErrorLogin() {
    if (this.state.errLogin) {
      return (
        <div className="alert alert-danger">
          <button type="button" className="close" data-dismiss="alert" aria-hidden="true">&times;</button>
          <strong>Error!</strong> {this.state.msg}
        </div>);
    } else {
      return;
    }
  }

  render() {
    const {
      email,
      password,
      formErrors
    } = this.state
    let errEmail, errPw;
    if (formErrors.email) {
      errEmail = <label id="email-error" style={{ color: 'red', marginLeft: 44 }} className="error">{formErrors.email}</label>;
    }
    if (formErrors.password) {
      errPw = <label id="password-error" style={{ color: 'red', marginLeft: 44 }} className="error">{formErrors.password}</label>;
    }

    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    {this.renderErrorLogin()}
                    <Form onSubmit={event => this.handleClick(event)}>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="Email" autoComplete="username" onChange={this.onChangeEmail} value={email} />
                      </InputGroup>
                      {errEmail}
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" placeholder="Password" autoComplete="current-password" onChange={this.onChangePassword} value={password} />
                      </InputGroup>
                      {errPw}
                      <InputGroup className="mb-4">
                        { process.env.REACT_APP_ENABLE_CAPCHA === 'true'?
                          <Recaptcha
                            // sitekey='6Lfrd4kUAAAAAJ064HqD4mwR1PVdyg99pxpeTHHD'  // if on localhost
                            // sitekey='6LcVQooUAAAAAHgHhZaHe3AZRZqus5l3cP-jHQQY'// If on server
                            sitekey={process.env.REACT_APP_SITE_CAPCHA}
                            render="explicit"
                            ref={e => recaptchaInstance = e}
                            verifyCallback={this.verifyCallback}
                            onloadCallback={this.reCaptchaLoaded}
                          />:''
                        }
                      </InputGroup>

                      <div style={{ height: 10 }}></div>
                      <Row>
                        <Col xs="6">
                          <Button color="primary" className="px-4" onClick={event => this.handleClick(event)}>Login</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button color="link" className="px-0" >
                            <Link to="/reset">Forgot password?</Link></Button>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
                <Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
                  <CardBody className="text-center">
                    <div>
                      <h2>Sign up</h2>
                      {/* <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.</p> */}
                      <Link to="/register">
                        <Button color="primary" className="mt-3" active tabIndex={-1}>Register Now!</Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
        <NotificationContainer />
      </div >
    );
  }
}

export default Login;
