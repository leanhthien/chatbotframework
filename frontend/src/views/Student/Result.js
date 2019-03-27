import React, { Component} from 'react';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Table
} from 'reactstrap';
import moment from 'moment'
import _ from 'lodash'
import axios from 'axios';
import cookie from 'react-cookies'


class Result extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');  
    this.state = {
      role:0,
      results : [],
      card3: false
    };
  }

  async componentDidMount() {
    try{
      let authen = await this.checkPermission();
      this.setState({role: authen.role});
      let results = await this.getResults();
      if(results) {
        results = results.sort((a, b) => {
          if (a && moment(a.createdAt).isValid() && b && moment(b.createdAt).isValid() &&
            moment(a.createdAt).isAfter(b.createdAt)) {
            return -1
          }
          else {
            return 1
          }
        })
        this.setState({results:results});
      }
    }catch(error){
      console.log(error)
    }
    
  }

  async getResults(){
    try{
      let response = await axios.get(`${this.apiBaseUrl}results`,  { headers: {"Authorization" : `Bearer ${this.token}`} });
      if(response.data.data){
        return response.data.data;       
      }      
      else{
        return null;
      }
    }
    catch(error) {      
      console.log(error);
      return null;
    }
  }

  async checkPermission(){
    try{
      let response = await axios.get(this.apiBaseUrl+'token',  { headers: {"Authorization" : `Bearer ${this.token}`} });
      if(response.data.auth !== true){
        await cookie.remove('user_token')
        return this.props.history.push("/login");        
      }      
      else{
        return response.data.decoded;
      }
    }
    catch(error) {
      this.props.history.push("/login");     
    };
  }

  async downloadLogs (questionId, exerciseId, courseId, log, data) {
    var element = document.createElement("a");
    let buf = ''
    if (data) {
      buf = await new Buffer(data)
    }
    if (log) {
      buf = await new Buffer(log)
    }
    var file = new Blob([buf.toString()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = data ?  `Submit_${courseId}_${exerciseId}_${questionId}.cpp` : `Logs_${courseId}_${exerciseId}_${questionId}.txt`;
    element.click();
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  genResults = ()=>{
    let group = [];
    if (!this.state.results || this.state.results.length === 0) return <tr/>
    this.state.results.forEach((element, index) => {
      group.push(<tr key={element.id}>
          <td>{index + 1}</td>
          <td>{_.get(element, 'question.exercise.course.name')}</td>
          <td>{_.get(element, 'question.exercise.name')}</td>
          <td>{_.get(element, 'question.id')}</td>
          <td>{moment(element.createdAt).local().format('LLLL')}</td>
          <td>{element.num_testcase}</td>
          <td>{element.status === 2 ? 'graded' : 'grading...'}</td>
          <td>{element.num_success}</td>
          <td>
            <div style={{cursor: 'pointer'}}
            onClick={event => this.downloadLogs(_.get(element, 'question.id'),
            _.get(element, 'question.exercise.name'),
            _.get(element, 'question.exercise.course.name'), element.log)}>Download logs
            </div>
          </td>
          <td>
            <div style={{cursor: 'pointer'}}
            onClick={event => this.downloadLogs(_.get(element, 'question.id'),
            _.get(element, 'question.exercise.name'),
            _.get(element, 'question.exercise.course.name'), null, element.data)}>Download the submission
            </div>
          </td>
         </tr>)
    });
    return group;
  }

  handleBackClick(event){
    return this.props.history.push(`/courses`); 
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Results</strong>              
              </CardHeader>
              <CardBody>
                <Table responsive striped>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Course</th>
                      <th>Exercise</th>
                      <th>Question</th>
                      <th>Time</th>
                      <th>Number testcase</th>
                      <th>Status</th>
                      <th>Testcase pass</th>
                      <th>Log</th>
                      <th>Submission</th>
                    </tr>
                  </thead>
                  <tbody>
                  {this.genResults()}
                  </tbody>
                </Table>
              </CardBody>
              <CardFooter>
                <Button type="text" size="sm" color="primary" onClick={event => this.handleBackClick(event)}><i className="fa fa-dot-circle-o"></i>Back</Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Result;
