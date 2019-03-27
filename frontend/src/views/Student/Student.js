import React, { Component } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Jumbotron,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
} from 'reactstrap';
import axios from 'axios'

class Forms extends Component {
  divStyle = {
    'whiteSpace': 'pre-wrap'
  }
  constructor(props) {
    super(props);
    this.state = {
      fadeIn: true,
      questions: [],
    };
    this.courseId = 1;
    this.exerciseId = 1;
    this.apiBaseUrl = process.env.REACT_APP_DOMAIN;
    //this.token = cookie.load('user_token');    
  }

  async componentDidMount() {
    //await this.checkPermission();
    let questions = await this.getQuestion();
    this.setState({questions:questions});
  }

  async getQuestion(){
    
    try{
      let response = await axios.get(`${this.apiBaseUrl}courses/${this.courseId}/exercises/${this.exerciseId}/questions`,  { headers: {"Authorization" : `Bearer ${this.token}`} });
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


  async handleSubmitClick(event, id){
    let keys = Object.keys(this.state);
    let contentOfId = keys.filter(x=>x.includes('content_'+id));
    let allCode = '';
    for(let i =0; i < contentOfId.length; i++){
      allCode += this.state['content_'+id+'_'+i];
    }
    let data ={
      code : allCode,
      question_id: id
    }
    await axios.post(this.apiBaseUrl + 'submitcode', data);
  }

  genJumbotron = (content)=>{
    if(content)
      return <Jumbotron>{content}</Jumbotron>
    else
      return;
  }

  genQuestion = ()=>{
    let children = [];
    if(!this.state.questions){
      return children
    }
    this.state.questions.forEach((e, index)=>{
      children.push(
        <Row>
          <Col xs="12" md="12">
            <Card>
              <CardHeader>
                <strong>Question {e.order}:</strong> 
              </CardHeader>
              <CardBody>
                {this.genJumbotron(e.description)}
                <Form action="" method="post" encType="multipart/form-data" className="form-horizontal">
                  {this.genCode(e.sourcecode,e.id)}
                </Form>
              </CardBody>
              <CardFooter>
                <Button type="submit" size="sm" color="primary" onClick={event => this.handleSubmitClick(event, e.id)}><i className="fa fa-dot-circle-o"></i> Submit</Button>
                <Button type="reset" size="sm" color="danger"><i className="fa fa-ban"></i> Reset</Button>
              </CardFooter>
            </Card>
          </Col>      
        </Row>
      )
    })
    return children;
  }

  genCode = (code,id)=>{
    if(!code){
      return <p>no code</p>;
    }
    let problem = [];
    let aparts = code.split('#TODO');
    for(let i = 0; i < aparts.length; i++){
      problem.push(aparts[i]);
      if(i!== aparts.length-1){
        problem.push('#TODO');
      }
    }
    let children = [];
    problem.forEach((element, myIndex) => {
      if(element === '#TODO'){
        children.push(<FormGroup row>
          <Col xs="12" md="12">
            <Input type="textarea" name="textarea-input" id="textarea-input" rows="9"
                   placeholder="#TODO" onChange = {(event) => this.setState({['content_'+id+'_'+myIndex]:event.target.value})}/>
          </Col>
          </FormGroup>);
      }
      else{
       
        children.push(<Label>{element}</Label>)
      }
    });
    problem.forEach((element, myIndex) => {
      if(element !== '#TODO'){
        this.setState({['content_'+id+'_'+myIndex]:element})
      }
    });
    return children;
  }

  render() {
    return (
      <div className="animated fadeIn" style={this.divStyle}>
        {this.genQuestion()}
      </div>
    );
  }
}

export default Forms;
