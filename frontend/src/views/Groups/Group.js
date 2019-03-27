import React, { Component } from 'react';
import {
  Table,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Popover,
  PopoverHeader,
  PopoverBody,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import axios from 'axios';
import cookie from 'react-cookies';
import './Group.css'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

class Group extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');
    this.courseId = this.props.match.params.id;
    this.state = {
      popoverOpens: {},
      role: 0,
      groups: [],
      groupIds: [],
      emails: [],
      isOpenPopup: false
    };
    this.togglePopup = this.togglePopup.bind(this)
    this.toggle = this.toggle.bind(this)
  }

  toggle(id) {
    if (!this.state.popoverOpens) return
    var popoverOpens = { ...this.state.popoverOpens } || {}
    popoverOpens[id] = !this.state.popoverOpens[id]
    this.setState({ popoverOpens });
  }

  async componentDidMount() {
    try {
      let authen = await this.checkPermission();
      this.setState({ role: authen.role });
      let groups = await this.getGroups();
      this.setState({ groups: groups });
      if (groups) {
        groups.forEach(x => {
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

  async getGroups() {
    try {
      let response = await axios.get(this.apiBaseUrl + `courses/${this.courseId}/groups`, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return response.data.data;
      }
      else {
        return null;
      }
    }
    catch (error) {
      console.log(error);
      return null;
    }
  }

  async getUserByGroupId(groupId) {
    try {
      let response = await axios.get(this.apiBaseUrl + `courses/${this.courseId}/groups/user/${groupId}`, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        return response.data.data;
      }
      else {
        return null;
      }
    }
    catch (error) {
      console.log(error);
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

  handleAddClick(event) {
    return this.props.history.push(`/courses/${this.courseId}/groups/create`);
  }

  handleEditClick(event, id) {
    return this.props.history.push(`/courses/${this.courseId}/groups/update/${id}`);
  }

  handleAssignClick(event, id) {
    return this.props.history.push(`/courses/${this.courseId}/groups/assign/${id}`);
  }

  handlePermissionAllClick(groupId) {
    return this.props.history.push(`/courses/${this.courseId}/groups/${groupId}/exercise`);
  }

  handleRemoveClick(event, id) {
    this.toggle(id)
  }

  async togglePopup(id, name) {
    let { emails, groupIds, groups, isOpenPopup } = this.state
    if (id && name) {
      if (groupIds.includes(id)) {
        let group = groups.find(item => item.id === id)
        emails = group.emails
        this.setState({ curName: name, emails })
      } else {
        emails = await this.getUserByGroupId(id)
        let accountEmail = await cookie.load('user_email')
        emails = emails.filter(item => item !== accountEmail)
        groups = groups.map(item => {
          if (id === item.id) {
            item.emails = emails
          }
          return item
        })
        groupIds.push(id)
        return this.setState({ curName: name, emails, groups, groupIds }, () => this.setState({ isOpenPopup: !isOpenPopup }))
      }
    }
    this.setState({ isOpenPopup: !isOpenPopup })
  }

  async handleDeleteClick(event, groupId) {
    try {
      let response = await axios.delete(this.apiBaseUrl + `courses/${this.courseId}/groups/${groupId}`, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data) {
        // return window.location.reload(); 
        let groups = await this.getGroups();
        this.setState({ groups: groups })
        if (groups && groups.lenght > 0) {
          groups.forEach(x => {
            var popoverOpens = { ...this.state.popoverOpens }
            popoverOpens[x] = false;
            this.setState({ popoverOpens })
          })
        }
      }
    }
    catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.code !== 200) {
        return NotificationManager.error(error.response.data.msg, 'Error!', 5000);
      }
      return NotificationManager.error('Somthing went wrong', 'Error!', 5000);
    }
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  genGroup = () => {
    let group = [];
    if (!this.state.groups) return <tr />
    this.state.groups.forEach((element, index) => {
      group.push(<tr key={element.id}>
        <td>
          <strong>{index + 1}&nbsp;  </strong>
        </td>
        <td>
          <div title={element.description} style={{ cursor: 'pointer', display: 'inline-block' }} onClick={event => this.togglePopup(element.id, element.name)}>{element.name}</div>
        </td>
        <td>
          <i title={'Edit'} className="fa fa-edit btn-link icon_handle_group" onClick={event => this.handleEditClick(event, element.id)}></i>
          <i title={'Assign for student'}className="fa fa-windows btn-link icon_handle_group" onClick={event => this.handleAssignClick(event, element.id)}></i>
          <i title={'Assign for question'} className="fa fa-flag btn-link icon_handle_group" onClick={event => this.handlePermissionAllClick(element.id)}></i>
          <button title={'remove'} className="card-heelement.idader-action btn-setting btn btn-link icon_handle_group" id={`popover_${element.id}`} onClick={event => this.handleRemoveClick(event, element.id)}><i className="fa fa-trash-o"></i></button>
          <Popover placement="right" isOpen={this.state.popoverOpens[element.id]} target={`popover_${element.id}`} toggle={this.toggle}>
            <PopoverHeader>Do you want to remove <strong>{element.name}</strong>?</PopoverHeader>
            <PopoverBody>
              <Button type="text" size="sm" color="danger" onClick={event => this.handleDeleteClick(event, element.id)}><i className="fa fa-dot-circle-o"></i> Remove</Button>
            </PopoverBody>
          </Popover>
        </td>
      </tr>)
    });
    return group;
  }

  checkViewRole = () => {
    let { emails, curName } = this.state
    if (this.state.role === 2 || this.state.role === 3) {
      return (
        <Row>
          {emails && curName ? <Modal isOpen={this.state.isOpenPopup} toggle={this.togglePopup} className={'model-preview-question'}>
            <ModalHeader toggle={this.togglePopup}>{`Name: ${curName}`}</ModalHeader>
            <ModalBody>
              <div >
                {emails.length === 0 ? `Don't have any student in group` : ''}
                {emails.map((item, index) => {
                  return (<div><strong>{parseInt(index) + 1}</strong>&nbsp;&nbsp; {item}</div>)
                })}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.togglePopup}>Cancel</Button>
            </ModalFooter>
          </Modal> : ''}
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Groups</strong>
              </CardHeader>
              <CardBody>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.genGroup()}
                  </tbody>
                </Table>
              </CardBody>
              <CardFooter>
                <Button type="text" size="sm" color="primary" onClick={event => this.handleAddClick(event)}><i className="fa fa-dot-circle-o"></i> Add</Button>
              </CardFooter>
            </Card>
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
        <NotificationContainer />
      </div>
    );
  }
}

export default Group;
