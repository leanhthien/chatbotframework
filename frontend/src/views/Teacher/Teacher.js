import React, { Component } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Fade,
  Row,
  ListGroup,
  ListGroupItem
} from 'reactstrap';
import cookie from 'react-cookies'
import { Link } from 'react-router-dom';

class Teacher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: true,
      fadeIn: true,
      timeout: 300,
    };
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    this.token = cookie.load('user_token');   
    this.courseId = this.props.match.params.id; 
  }

  render() {
    return (
      <div className="animated fadeIn" style={this.divStyle}>
         <Row>
          <Col xs="12">
            <Fade timeout={this.state.timeout} in={this.state.fadeIn}>
              <Card>
                <CardHeader>
                  <i className="fa fa-edit"></i>Options
                </CardHeader>
                <Collapse isOpen={this.state.collapse} id="collapseExample">
                  <CardBody>
                    <ListGroup>
                      <ListGroupItem key="exercises"><Link to={`/courses/${ this.courseId }/exercises`}>Exercises</Link></ListGroupItem>
                      <ListGroupItem key="groups"><Link to={`/courses/${ this.courseId }/groups`}>Groups</Link></ListGroupItem>
                    </ListGroup>
                  </CardBody>
                </Collapse>
              </Card>
            </Fade>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Teacher;
