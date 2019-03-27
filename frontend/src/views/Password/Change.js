import React, { Component } from 'react';
import cookie from 'react-cookies';
import AlertService from '../../services/AlertService';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
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


class Password extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.username = cookie.load('user_email');
    this.token = cookie.load('user_token');


    this.state = {
      password: "",
      newPw: "",
      confirmNewPw: "",
      formErrors: { newPw: '', confirmNewPw: '' }
    };
  }

  onChangePassword = (e) => {
    this.setState({ newPw: e.target.value })
    this.validateField('newPw', e.target.value)
  }
  onChangeConfirmPassword = (e) => {
    this.setState({ confirmNewPw: e.target.value })
    this.validateField('confirmNewPw', e.target.value)
  }
  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let newPwValid = this.state.newPw;
    let confirmNewPwValid = this.state.confirmNewPw;

    switch (fieldName) {
      case 'newPw':
        newPwValid = value.length >= 6;
        fieldValidationErrors.newPw = newPwValid ? '' : 'Password at least 6 characters';
        break;
      case 'confirmNewPw':
        confirmNewPwValid = (value === newPwValid);
        fieldValidationErrors.confirmNewPw = confirmNewPwValid ? '' : 'Do not match, please re-enter';
        break;
      default:
        break;
    }
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
      const { formErrors } = this.state;
      if (formErrors.newPw === '' && formErrors.confirmNewPw === '') {
        let apiBaseUrl = process.env.REACT_APP_DOMAIN;
        let payload = {
          "email": this.username,
          "password": this.state.password,
          "newpassword": this.state.newPw,
          "confirmpassword": this.state.confirmNewPw
        }
        AlertService.loadingPopup()
        let response = await axios.post(apiBaseUrl + 'password/change', payload, { headers: { "Authorization": `Bearer ${this.token}` } });
        AlertService.swal.close()
        if (response && response.data && response.data.code !== 200) {
          return NotificationManager.error(response.data.msg, 'Error!', 5000);
        }
        else {
          NotificationManager.success(`Change password successful!`, 'Success', 5000)
          setTimeout(() => {
            this.props.history.push("/login");
          }, 5000)

        }
      }

    }
    catch (error) {
      if (error && error.response && error.response.data && error.response.data.code !== 200) {
        AlertService.swal.close()
        return NotificationManager.error(error.response.data.msg, 'Error!', 5000);
      }
      else {
        AlertService.swal.close()
        console.log(error);
        return NotificationManager.error('Error on server', 'Error!', 5000);

      }

    }
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    const {
      newPw,
      confirmNewPw,
      formErrors
    } = this.state
    let errNewPw, errConfirmNewPw;
    if (formErrors.newPw) {
      errNewPw = <label id="email-error" style={{ color: 'red' }} className="error">{formErrors.newPw}</label>;
    }
    if (formErrors.confirmNewPw) {
      errConfirmNewPw = <label id="email-error" style={{ color: 'red' }} className="error">{formErrors.confirmNewPw}</label>;
    }

    return (
      <div className="animated fadeIn">
        <Row className="justify-content-center">
          <Col>
            <CardGroup>
              <Card>
                <CardHeader>
                  Change password
                </CardHeader>
                <CardBody>
                  <Form action="" method="post" className="form-horizontal">
                    <FormGroup row>
                      <Label sm="5" size="sm" htmlFor="input-small">Old password</Label>
                      <Col sm="6">
                        <Input bsSize="sm" type="password" id="input-small" value={this.state.password} name="input-small" className="input-sm" placeholder="Old password" onChange={event => this.setState({ password: event.target.value })} />
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="5" htmlFor="input-normal">New password</Label>
                      <Col sm="6">
                        <Input type="password" id="input-normal-pass" name="input-normal" placeholder="New password" onChange={this.onChangePassword} value={newPw} />
                        {errNewPw}
                      </Col>
                    </FormGroup>
                    <FormGroup row>
                      <Label sm="5" htmlFor="input-normal">Confirm password</Label>
                      <Col sm="6">
                        <Input type="password" id="input-normal" name="input-normal" placeholder="Confirm password" onChange={this.onChangeConfirmPassword} value={confirmNewPw} />
                        {errConfirmNewPw}
                      </Col>
                    </FormGroup>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button type="submit" disabled={formErrors.newPw !== '' || formErrors.confirmNewPw !== '' || !this.state.password || !this.state.newPw || !this.state.confirmNewPw} size="sm" color="primary" onClick={event => this.handleClick(event)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
                  <Button type="reset" size="sm" color="danger" onClick={event => this.setState({ formErrors: {}, confirmNewPw: '', password: '', newPw: '' })}><i className="fa fa-ban"></i> Reset</Button>
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

export default Password;
