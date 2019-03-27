import React, { Component } from 'react';
import { Button, Card, CardBody, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert';
import AlertService from '../../services/AlertService';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import './Reset.css'
import Recaptcha from 'react-recaptcha'
let recaptchaInstance;
// create a reset function
const resetRecaptcha = () => {
    recaptchaInstance.reset();
};
class Reset extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.reCaptchaLoaded = this.reCaptchaLoaded.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this)
        this.state = {
            email: '',
            formErrors: {
                email: ''
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

    validateField(fieldName, value) {
        let fieldValidationErrors = this.state.formErrors;
        let emailValid = this.state.email;
        switch (fieldName) {
            case 'email':
                emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
                fieldValidationErrors.email = emailValid ? '' : 'Invalid email';
                break;
            default:
                break;
        }
    }

    renderErrorReset() {
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
    reCaptchaLoaded () {
        // console.log("Capcha have successful loaded")
    }

    verifyCallback (response) {
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
                return Swal('Error!', "Please select captcha", 'error')
            }
            const formErrors = this.state.formErrors
            if (formErrors.email === '') {
                let apiBaseUrl = process.env.REACT_APP_DOMAIN;
                let payload = {
                    "email": this.state.email,
                    "captcha": this.state.tokenRecaptcha
                }
                AlertService.loadingPopup()
                let response = await axios.post(apiBaseUrl + 'password/reset', payload);
                AlertService.swal.close()
                if (response && response.data && response.data.code !== 200) {
                    AlertService.swal.close()
                    if (process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
                        resetRecaptcha()
                    }
                    this.setState({
                        resForm: {
                            hasError: true, msg: response.data.msg
                        }
                    })
                }
                else {
                    AlertService.swal.close()
                   
                    NotificationManager.success("Please check mail to verify", 'Success', 5000)
                    // Swal('Success', "Please check mail to get new password", 'success')
                    setTimeout(()=>{
                        this.props.history.push("/login");
                    }, 5000)
                }


            }
        }
        catch (error) {
            AlertService.swal.close()
            if (error && error.response && error.response.data && error.response.data.msg) {
                if (process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
                    resetRecaptcha()
                }
                this.setState({
                    resForm: {
                        hasError: true, msg: error.response.data.msg
                    }
                })
            }
            else {
                if (process.env.REACT_APP_ENABLE_CAPCHA === 'true') {
                    resetRecaptcha()
                }
                this.setState({
                    resForm: { hasError: true, msg: " Error on server" }
                })
            }
        }
    }
    render() {
        const { email, formErrors } = this.state
        let errEmail
        if (formErrors.email) {
            errEmail = <label id="email-error" style={{ color: 'red', marginLeft: 44 }} className="error">{formErrors.email}</label>;
        }
        return (
            <div className="app flex-row align-items-center">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="9" lg="7" xl="6">
                            <Card className="mx-4">
                                <CardBody className="p-4">
                                    {this.renderErrorReset()}
                                    <Form>
                                        <h1>Reset password</h1>
                                        <p className="text-muted">Enter your email address</p>
                                        <InputGroup className="mb-3">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>@</InputGroupText>
                                            </InputGroupAddon>
                                            <Input type="text" placeholder="Email" autoComplete="email" onChange={this.onChangeEmail} value={email} />
                                        </InputGroup>
                                        {errEmail}
                                        <InputGroup className="mb-3">
                                            {process.env.REACT_APP_ENABLE_CAPCHA === 'true' ?
                                                <Recaptcha
                                                    //sitekey='6Lfrd4kUAAAAAJ064HqD4mwR1PVdyg99pxpeTHHD'  // if on localhost
                                                    // sitekey='6LcVQooUAAAAAHgHhZaHe3AZRZqus5l3cP-jHQQY'// If on server
                                                    sitekey={process.env.REACT_APP_SITE_CAPCHA}
                                                    render="explicit"
                                                    ref={e => recaptchaInstance = e}
                                                    verifyCallback={this.verifyCallback}
                                                    onloadCallback={this.reCaptchaLoaded}
                                                />
                                                : ""}
                                        </InputGroup>
                                        <div style={{ height: 15 }}></div>
                                        <Button color="success" block onClick={event => this.handleClick(event)}>Submit</Button>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
                <NotificationContainer />
            </div>
        );
    }
}

export default Reset;
