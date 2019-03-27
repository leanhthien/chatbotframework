import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody
  
} from 'reactstrap';
import axios from 'axios';
import cookie from 'react-cookies';


class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');

    this.state = {
      role:0,
      courses : []
    };
  }

  async componentDidMount() {
    try{
      let authen = await this.checkPermission();
      if(!authen)
        return this.props.history.push("/login");  
      this.setState({role: authen.role});
      let courses = await this.getCourses();
      if(courses)
        this.setState({courses:courses});
    }
    catch(e){
      console.log(e)
    }
  }

  async getCourses(){
    try{
      let response = await axios.get(this.apiBaseUrl+'courses',  { headers: {"Authorization" : `Bearer ${this.token}`} });
      if(response.data.data.courses){
        return response.data.data.courses;       
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
      console.log(error);
      return this.props.history.push("/login");
    }
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  genStudentTACourses = () => {
    let group = [];
    if (!this.state.courses || this.state.courses.length <= 0) return group
    // TA
    if(this.state.role === 2){
      this.state.courses.forEach((element, index) => {
        group.push(
          <tr key={index}>
            <td>{index +1}</td>
            <td title={element.description}><Link className="card-headelement.ider-action btn-setting btn btn-link" to={`/courses/${ element.id }/teacher`}>{element.name}</Link></td>
          </tr>
        )
      })
    }
    // student
    else if(this.state.role === 1){
      this.state.courses.forEach((element, index) => {
        group.push(
          <tr key={index}>
            <td>{index +1}</td>
            <td title={element.description}><Link className="card-headelement.ider-action btn-setting btn btn-link" to={`/courses/${ element.id }/exercises`}>{element.name}</Link></td>
          </tr>
        )
      })
    }
    return group
  }

  checkViewRole = ()=>{
    if(this.state.role === 2 || this.state.role === 1){
      return (
        <Row>
          <Col sm="12" xl="12">
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i><strong>Courses</strong>              
              </CardHeader>
              <CardBody>
              <Table responsive striped>
                  <thead>
                  <tr>
                    <th>No</th>
                    <th>Name</th>
                  </tr>
                  </thead>
                  <tbody>
                  {this.genStudentTACourses()}
                  </tbody>
                </Table>
                {/* <Pagination>
                  <PaginationItem disabled><PaginationLink previous tag="button">Prev</PaginationLink></PaginationItem>
                  <PaginationItem active>
                    <PaginationLink tag="button">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem><PaginationLink tag="button">2</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink tag="button">3</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink tag="button">4</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationLink next tag="button">Next</PaginationLink></PaginationItem>
                </Pagination> */}
              </CardBody>
            </Card>
          </Col>
        </Row>
        )
    }
    else if(this.state.role === 3){
      return this.props.history.push('/Courses')
    }
    else{
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

export default Dashboard;
