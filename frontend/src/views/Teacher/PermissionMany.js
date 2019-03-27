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
  CardBody,
  Popover,
  PopoverHeader,
  PopoverBody,
  Table,
  ListGroup
} from 'reactstrap';
import moment from 'moment'
import axios from 'axios';
import swal from 'sweetalert'
import cookie from 'react-cookies';
import renderHTML from 'react-render-html'
import './Permission.css'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import _ from 'lodash'

const styles = {
  divCheckbox: {
    //width: '200px'
  },
  divLabelCheckbox: {
    margin: '0px',
    'msTransform': 'scale(1.3)',
    'MozTransform': 'scale(1.3)',
    'WebkitTransform': 'scale(1.3)', /* Safari and Chrome */
    'OTransform': 'scale(1.3)', /* Opera */
  },
  divTextCheckbox: {
    display: 'inline-block',
    width: '100%', whiteSpace: 'nowrap', overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer'
  },
  divGroupQuestions: {
    margin: '10px 0px 20px 0px'
  }
}
class Permissions extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.questionId = this.props.match.params.id;
    this.token = cookie.load('user_token');
    this.courseId = this.props.match.params.courseId;
    this.exerciseId = this.props.match.params.exerciseId;
    this.groupId = this.props.match.params.groupId
    this.state = {
      tooltipOpens: {},
      groupId: '',
      groups: [],
      startTime: moment().format('YYYY-MM-DDTHH:mm'),
      endTime: moment().format('YYYY-MM-DDTHH:mm'),
      popoverOpens: {},
      questionCheck: {},
      results: [],
    };
    this.handleChange = this.handleChange.bind(this)
    this.toggle = this.toggle.bind(this)
    this.toggleToolTip = this.toggleToolTip.bind(this)
  }

  toggle(id) {
    if (!this.state.popoverOpens) return
    var popoverOpens = { ...this.state.popoverOpens } || {}
    Object.keys(popoverOpens).forEach(function (key) {
      if (key !== id) {
        popoverOpens[key] = false
      }
    });
    popoverOpens[id] = !this.state.popoverOpens[id]
    this.setState({ popoverOpens });
  }

  toggleToolTip(id) {
    var tooltipOpens = { ...this.state.tooltipOpens } || {}
    tooltipOpens[id] = !this.state.tooltipOpens[id]
    this.setState({ tooltipOpens });
  }


  async componentDidMount() {
    let authen = await this.checkPermission();
    this.setState({ role: authen.role });
    let results = await this.getAssigns();
    this.setState({ results: results });
    let groupId
    if (!this.groupId) {
      let groups = await this.getGroups();
      if (groups) {
        groupId = groups[0].id
        this.setState({ groups, groupId: groups[0].id })
      } else {

      }
    } else {
      let groups = await this.getGroup();
      if (groups) {
        groupId = groups.id
        this.setState({ groups, groupId: groups.id })
      }
    }
    let questions = await this.getQuestions();
    if (questions) {
      questions = questions.map(item => {
        item.description = renderHTML(item.description)
        return item
      })
    }
    this.setState({ questions: questions });
    this.checkAssigned(groupId);
    if (questions && questions.length > 0) {
      questions.forEach(x => {
        let tooltipOpens = { ...this.state.tooltipOpens }
        tooltipOpens[x.id] = false

        let popoverOpens = { ...this.state.popoverOpens }
        popoverOpens[x.id] = false
        this.setState({ popoverOpens, tooltipOpens })
      })
    }
  }

  async checkAssigned(groupId) {
    // permissions is  questions of group 
    try {
      let permissions = await this.getPermissions(groupId);
      let permissionIds = []
      if (permissions) {
        for (const element of permissions) {
          permissionIds.push(element.questionId)
        }
      }

      let { questionCheck } = this.state
      this.state.questions.forEach(item => {
        if (permissionIds.includes(item.id)) {
          questionCheck[item.id] = true
        }
        else {
          questionCheck[item.id] = false
        }
      })

      this.setState({ questionCheck })
      let rows = []
      let questions = this.state.questions


      questions.forEach(item => {
        if (permissionIds.includes(item.id)) {
          let permission = permissions.filter(element => {
            if (element.questionId === item.id) return true
            return false
          })
          let stillUtc = moment.utc(permission[0].start).toDate();
          let localStartTime = moment(stillUtc).format('YYYY-MM-DDTHH:mm')
          let stillUtcStart = moment.utc(permission[0].end).toDate();
          let localEndTime = moment(stillUtcStart).format('YYYY-MM-DDTHH:mm')
          rows.push({
            name: item.name,
            id: item.id,
            description: item.description,
            start: localStartTime,
            order: permission[0].order || 1,
            end: localEndTime
          })
        }
        else {
          rows.push({
            name: item.name,
            id: item.id,
            description: item.description,
            start: this.state.startTime,
            order: 1,
            end: this.state.startTime
          })
        }

      })
      this.setState({ rows })
    } catch (error) {
      console.log(error)
    }

  }
  async getPermissions(groupId) {
    try {
      let response = await axios.get(`${this.apiBaseUrl}group/${groupId}/permissions`, { headers: { "Authorization": `Bearer ${this.token}` } });
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
  async getAssigns() {
    try {
      let exerciseId = _.get(this.props, 'match.params.exerciseId')
      let response = await axios.get(`${this.apiBaseUrl}courses/${this.courseId}/exercises/${exerciseId}/assigns`, { headers: { "Authorization": `Bearer ${this.token}` } });
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

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value })
  }

  handleChangeOnQuestion(id, name, value) {
    let rows = this.state.rows
    for (const e of rows) {
      if (id === e.id && name === 'startTime') {
        e.start = value
      }
      else if (id === e.id && name === 'endTime') {
        e.end = value

      }
      else if (id === e.id && name === 'order') {
        e.order = value
      }
    }
    this.setState({ rows });
  }
  handleCheckbox(id, value) {
    let { questionCheck } = this.state
    questionCheck[id] = !questionCheck[id]
    this.setState({ questionCheck })
  }

  handleShowDetail(id) {
    this.toggle(id)
  }

  async getQuestions() {
    try {
      let response = await axios.get(`${this.apiBaseUrl}courses/${this.courseId}/exercises/${this.exerciseId}/questions`, { headers: { "Authorization": `Bearer ${this.token}` } });
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


  async handleClick(event) {
    try {

      if (this.state.rows) {
        for (let item of this.state.rows) {
          if (!moment(item.start).isValid() || !moment(item.end).isValid()) {
            return NotificationManager.warning('Start Time and End Time is Invalid ', 'Warning!', 5000);
          }
        }
      }
     
      let ticked = this.state.rows.filter(item => {
        if (this.state.questionCheck[item.id]) return true
        return false
      })
      let untick = this.state.rows.filter(item => {
        if (this.state.questionCheck[item.id]) return false
        return true
      })

      let orders = []
      for (const item of ticked) {
        if (item.start && item.end && moment(item.end).subtract(1, 'minute').isBefore(item.start)) {
          return NotificationManager.warning(`End time must be greater than start time Where question: ${item.name}`, 'Warning!', 5000);
        }
        orders.push({
          'order': item.order
        })
      }
      let checkMatchOrder = false
      orders.reduce((sums, entry) => {
        sums[entry.order] = (sums[entry.order] || 0) + 1;
        if (sums[entry.order] >= 2) {
          checkMatchOrder = true
        }
        return sums;
      }, {});
      if (checkMatchOrder) {
        return NotificationManager.warning('Questions must be order', 'Warning!', 5000);
      }
      let apiBaseUrl = process.env.REACT_APP_DOMAIN;
      for (const item of ticked) {
        item.start = moment(item.start).utc()
        item.end = moment(item.end).utc()
      }
      let payload = {
        "group_id": this.state.groupId,
        "tickeds": ticked,
        "unTicks": untick
      }
      // console.log("payload", payload)
      let response = await axios.post(apiBaseUrl + `permission/create`, payload, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.data && response.data.code === 200) {
        swal('Success!', '', 'success').then(result => {
          if (result) {
            return this.props.history.goBack();
          }
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


  async getGroups() {
    try {
      if (!this.courseId) swal('Error', `Don't have courseId`, 'error')
      let response = await axios.get(this.apiBaseUrl + `/courses/${this.courseId}/groups`, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.code === 200 && response.data.data) {
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

  async getGroup() {
    try {
      if (!this.courseId) swal('Error', `Don't have courseId`, 'error')
      let response = await axios.get(this.apiBaseUrl + `/courses/${this.courseId}/groups/${this.groupId}`, { headers: { "Authorization": `Bearer ${this.token}` } });
      if (response.data.code === 200 && response.data.data) {
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
  genAsignResult = () => {
    let assigns = [];
    if (!this.state.rows) return <tr />
    let options = []
    let dem = 0
    this.state.rows.forEach(item => {
      options.push(<option key={item.id} value={++dem}>{dem}</option>)
    })
    for (const element of this.state.rows) {
      assigns.push(<tr key={element.id}>
        <td>{element.id}</td> 
        <td id={`tooltip_${element.id}`} onClick={() => this.toggleToolTip(element.id)}>{element.name}</td>
        <Popover className={'description-permission-popOver'} placement="right" style={{ whiteSpace: 'normal', }} isOpen={this.state.tooltipOpens[element.id]} target={`tooltip_${element.id}`} toggle={() => this.toggleToolTip(element.id)}>
          <PopoverHeader>{`#${element.id} : ${element.name}`}</PopoverHeader>
          <PopoverBody className={'description-permission-popover-body'}  >{element.description ? element.description : ''}</PopoverBody>
        </Popover>
        <td>
          <FormGroup style={styles.divCheckbox} key={element.id} check inline>
            <Label style={styles.divLabelCheckbox}>
              <Input checked={this.state.questionCheck[element.id]} onChange={() =>{}} value={element.id} onClick={event => this.handleCheckbox(element.id, event.target.value)} type="checkbox" />
            </Label>
          </FormGroup> </td>
        <td><input
          className='permistion-input-date'
          type="datetime-local"
          name="date"
          id="exampleDate"
          value={moment(element.start).format('YYYY-MM-DDTHH:mm')}
          onChange={event => this.handleChangeOnQuestion(element.id, 'startTime', event.target.value)}
          placeholder="date placeholder"
        /> </td>
        <td>
          <input
            className='permistion-input-date'
            type="datetime-local"
            name="date"
            id="exampleDate"
            value={moment(element.end).format('YYYY-MM-DDTHH:mm')}
            onChange={event => this.handleChangeOnQuestion(element.id, 'endTime', event.target.value)}
            placeholder="date placeholder"
          />

        </td>
        <td>
          <Input value={element.order} type="select" name="ccmonth" id="ccmonth" onChange={event => this.handleChangeOnQuestion(element.id, 'order', event.target.value)}>
            {options}
          </Input>
        </td>

      </tr >)
    }


    return assigns;
  }
  genQuestions = () => {
    let questions = [];
    if (!this.state.questions || this.state.questions.length <= 0)
      return <div className="animated fadeIn pt-1 text-center">Don't have any question</div>
    this.state.questions.forEach(element => {
      let description = renderHTML(element.description)
      questions.push(
        <FormGroup style={styles.divCheckbox} key={element.id} check inline>
          <Label style={styles.divLabelCheckbox}>
            <Input value={element.id} onClick={event => this.handleCheckbox(element.id, event.target.value)} type="checkbox" />
          </Label>
          <div style={styles.divTextCheckbox} id={`popover_${element.id}`} onClick={event => this.handleShowDetail(element.id)} >#{element.id}&nbsp;&nbsp;{element.name} </div>
          <Popover placement="right" id={element.id} isOpen={this.state.popoverOpens[element.id]} target={`popover_${element.id}`} toggle={this.toggle.bind(this)}>
            <PopoverHeader> <strong>#{element.id} &nbsp;&nbsp; {element.name}</strong></PopoverHeader>
            <PopoverBody>
              {description ? description : ''}
            </PopoverBody>
          </Popover>
        </FormGroup>
      )
    });
    return questions;
  }

  genGroup = () => {
    if (this.groupId) {
      let { groups } = this.state
      if (!groups) {
        return <option key='option'>option</option>
      }
      return <option key='option'>{groups.name}</option>
    }
    let group = [];
    group.push(<option key='option'>option</option>)
    if (!this.state.groups || this.state.groups.length <= 0) return group
    this.state.groups.forEach(element => {
      group.push(<option key={element.id} value={element.id}>{element.name}</option>)
    });
    return group;
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  async handleSelectGroup(groupId) {
    if (groupId === 'option') {
      this.setState({ groupId: 'option' })
      let questions = await this.getQuestions();
      if (questions) {
        questions = questions.map(item => {
          item.description = renderHTML(item.description)
          return item
        })
      }
      this.setState({ questions: questions });
    } else {
      this.setState({ groupId: groupId })
      let questions = await this.getQuestions();
      if (questions) {
        questions = questions.map(item => {
          item.description = renderHTML(item.description)
          return item
        })
      }
      this.setState({ questions: questions });

      this.checkAssigned(groupId);
      if (questions && questions.length > 0) {
        questions.forEach(x => {
          let tooltipOpens = { ...this.state.tooltipOpens }
          tooltipOpens[x.id] = false

          let popoverOpens = { ...this.state.popoverOpens }
          popoverOpens[x.id] = false
          this.setState({ popoverOpens, tooltipOpens })
        })
      }
    }


  }
  render() {
    return (
      <div className="animated fadeIn">
        <Row className="justify-content-center">
          <Col>
            <CardGroup>
              <Card>
                <CardHeader>
                  Assign questions to group
                </CardHeader>
                <CardBody>
                  <Form action="" method="post" className="form-horizontal">
                    <FormGroup>
                      <Label htmlFor="ccmonth">Groups</Label>
                      <Input type="select" value={this.state.groupId} name="ccmonth" id="ccmonth" onChange={event => this.handleSelectGroup(event.target.value)}>
                        {this.genGroup()}
                      </Input>
                    </FormGroup>
                  </Form>


                  <Form>
                    <Row>
                      <Col sm="12" xl="12">
                        <Card>
                          <ListGroup>
                            <Table className='table table-striped' responsive striped>
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Question Name</th>
                                  <th>Assigned</th>
                                  <th>Start time</th>
                                  <th>End time</th>
                                  <th>Question order</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.genAsignResult()}
                              </tbody>
                            </Table>
                          </ListGroup>
                        </Card>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button disabled={!this.state.groupId || this.state.groupId === 'option'} type="submit" size="sm" color="primary" onClick={event => this.handleClick(event)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
                  {/* <Button disabled={!this.state.groupId || this.state.groupId === 'option'} type="submit" size="sm" color="primary" onClick={event => this.handlePreviewClick(event)}><i className="fa fa-dot-circle-o"></i> Preview</Button> */}
                  <Button type="reset" size="sm" color="danger"><i className="fa fa-ban"></i> Reset</Button>
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

export default Permissions;
