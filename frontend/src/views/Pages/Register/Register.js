import React, { Component } from 'react';
import { Button, Card, CardBody, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import './Register.css'
import Recaptcha from 'react-recaptcha'
let recaptchaInstance;
// create a reset function
const resetRecaptcha = () => {
  recaptchaInstance.reset();
};

class Register extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.reCaptchaLoaded = this.reCaptchaLoaded.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this)

    this.state = {
      username: '',
      password: '',
      email: '',
      fullname: '',
      repassword: '',
      formErrors: {
        email: '', password: '', pwConfirm: ''
      },
      resForm: {
        msg: '',
        hasError: false
      },
      isVerified: false,
      tokenRecaptcha: '',

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
  onChangePwConfirm = (e) => {
    this.setState({ repassword: e.target.value })
    this.validateField('repassword', e.target.value)
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let emailValid = this.state.email;
    let passwordValid = this.state.password;
    let pwConfirmValid = this.state.repassword;
    switch (fieldName) {
      case 'email':
        emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
        fieldValidationErrors.email = emailValid ? '' : 'Invalid email';
        break;
      case 'password':
        passwordValid = value.length >= 6;
        fieldValidationErrors.password = passwordValid ? '' : 'Password at least 6 characters';
        break;
      case 'repassword':
        pwConfirmValid = (passwordValid === value);
        fieldValidationErrors.pwConfirm = pwConfirmValid ? '' : 'Do not match, please re-enter';
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

  async handleClick(event) {
    event.preventDefault();
    try {
      if (!this.state.isVerified && process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
        return NotificationManager.error('Please select captcha', 'Error!', 5000);
      }
      const formErrors = this.state.formErrors
      if (formErrors.email === '' && formErrors.password === '' && formErrors.pwConfirm === '') {
        const { resForm } = this.state;
        let apiBaseUrl = process.env.REACT_APP_DOMAIN;
        let payload = {
          "username": this.state.username,
          "password": this.state.password,
          "fullname": this.state.fullname,
          "email": this.state.email.toLowerCase(),
          "captcha": this.state.tokenRecaptcha,
        }
        let response = await axios.post(apiBaseUrl + 'register', payload);
        if (response && response.data && response.data.code !== 200) {
          if (process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
            resetRecaptcha()
          }
          resForm.hasError = true;
          resForm.msg = response.data.msg;
          this.setState({ resForm: resForm });
        }
        else {
          this.props.history.push("/login");
        }
      }

    }
    catch (error) {
      if (error && error.response && error.response.data && error.response.data.code !== 200) {
        if (process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
          resetRecaptcha()
        }
        this.setState({ resForm: { hasError: true, msg: error.response.data.msg } })
      }
      else {
        if (process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
          resetRecaptcha()
        }
        this.setState({ resForm: { hasError: true, msg: "Something went wrong, please try again" } })
      }

      console.log(error);
    };
  }

  genUsername() {
    return <Input type="text" placeholder="Ma so sinh vien" autoComplete="username" onChange={event => this.setState({ username: event.target.value })} />
  }

  render() {

    const { email, password, pwConfirm, formErrors } = this.state
    let errEmail, errPw, errPwConfirm;
    if (formErrors.email) {
      errEmail = <label id="email-error" style={{ color: 'red', marginLeft: 44 }} className="error">{formErrors.email}</label>;
    }
    if (formErrors.password) {
      errPw = <label id="password-error" style={{ color: 'red', marginLeft: 44 }} className="error">{formErrors.password}</label>;
    }
    if (formErrors.pwConfirm) {
      errPwConfirm = <label id="pwConfirm-error" style={{ color: 'red', marginLeft: 44 }} className="error">{formErrors.pwConfirm}</label>;
    }
    //onChange={event => this.setState({ password: event.target.value })}
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
                      <Input type="text" placeholder="Fullname" autoComplete="fullname" onChange={event => this.setState({ fullname: event.target.value })} />
                    </InputGroup>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>@</InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Email" autoComplete="email" onChange={this.onChangeEmail} value={email} />
                    </InputGroup>
                    {errEmail}
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="Password" autoComplete="new-password" onChange={this.onChangePassword} value={password} />
                    </InputGroup>
                    {errPw}
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="Repeat password" autoComplete="new-password" onChange={this.onChangePwConfirm} value={pwConfirm} />
                    </InputGroup>
                    {errPwConfirm}
                    <InputGroup className="mb-3">
                    { process.env.REACT_APP_ENABLE_CAPCHA === 'true'?
                      <Recaptcha
                        //sitekey='6Lfrd4kUAAAAAJ064HqD4mwR1PVdyg99pxpeTHHD'  // if on localhost
                        // sitekey='6LcVQooUAAAAAHgHhZaHe3AZRZqus5l3cP-jHQQY'// If on server
                        sitekey={process.env.REACT_APP_SITE_CAPCHA}
                        render="explicit"
                        ref={e => recaptchaInstance = e}
                        verifyCallback={this.verifyCallback}
                        onloadCallback={this.reCaptchaLoaded}
                      />
                      :""
                    }
                    </InputGroup>
                    <div style={{ height: 20 }}></div>
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
