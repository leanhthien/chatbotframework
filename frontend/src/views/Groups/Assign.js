import React, { Component } from 'react';
import {
  Fade,
  Collapse,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button
} from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert'
import cookie from 'react-cookies';


class Group extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.groupId = this.props.match.params.groupId;
    this.courseId = this.props.match.params.id;
    this.state = {
      collapse: true,
      fadeIn: true,
      role: 0,
      selectedFile: {}
    };
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
      console.log(error);
      return this.props.history.push("/login");
    }
  }

  async handleSubmitClick(event) {
    const data = new FormData()
    data.append('uploadfile', this.state.selectedFile, this.state.selectedFile.name);
    let response = await axios.post(this.apiBaseUrl + `courses/${this.courseId}/groups/assign/${this.groupId}`, data, { headers: { "Authorization": `Bearer ${this.token}` } });
    if (response.data.data) {
      Swal('Success', 'Students have already assigned to group', 'success').then(result => {
        return this.props.history.push(`/courses/${this.courseId}/groups`)
      })
    } else {
      Swal('Error', '', 'error')
    }
  }

  handleBackClick () {
    this.props.history.push(`/courses/${this.courseId}/groups`)
  }


  handleSelectedFile = event => {
    this.setState({
      selectedFile: event.target.files[0]
    })
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  checkViewRole = () => {
    if (this.state.role === 1) {
      return <div className="animated fadeIn pt-1 text-center">Student do not have enough permission</div>
    }
    else if (this.state.role === 2 || this.state.role === 3) {
      return (
        <Row>
          <Col xs="12">
            <Fade timeout={this.state.timeout} in={this.state.fadeIn}>
              <Card>
                <CardHeader>
                  <i className="fa fa-edit"></i>Create group assign
                    <div className="card-header-actions">
                    <Button color="link" className="card-header-action btn-setting"><i className="icon-settings"></i></Button>
                    <Button color="link" className="card-header-action btn-minimize" data-target="#collapseExample" onClick={this.toggle}><i className="icon-arrow-up"></i></Button>
                    <Button color="link" className="card-header-action btn-close" onClick={this.toggleFade}><i className="icon-close"></i></Button>
                  </div>
                </CardHeader>
                <Collapse isOpen={this.state.collapse} id="collapseExample">
                  <CardBody>
                    <Form className="form-horizontal">

                      <FormGroup row>
                        <Col md="3">
                          <Label htmlFor="file-input">Upload csv file which contains user email</Label>
                        </Col>
                        <Col xs="12" md="9">
                          <Input type="file" id="sourcecode" name="sourcecode" onChange={this.handleSelectedFile} />
                        </Col>
                      </FormGroup>
                      <div className="form-actions">
                        <Button color="primary" onClick={event => this.handleSubmitClick(event)}>OK</Button>
                        <Button color="secondary" onClick={event => this.handleBackClick(event)}>Cancel</Button>
                      </div>
                    </Form>
                  </CardBody>
                </Collapse>
              </Card>
            </Fade>
          </Col>
        </Row>
      )
    }
    else {
      return this.loading();
    }
  }

  render() {
    return (
      <div className="animated fadeIn">
        {this.checkViewRole()}
      </div>
    );
  }
}

export default Group;
