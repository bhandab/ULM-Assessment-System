import React, { Component } from 'react'
import {Card} from 'react-bootstrap'

export default class Dashboard extends Component {
  render() {
    return (
      <section className="panel important border border-info rounded p-3">
      <Card>
      <Card.Header><h1 style={{textAlign:"center"}}> WELCOME TO ULM STUDENT EVALUATION SYSTEM </h1> </Card.Header>
      </Card>
      <Card.Body>
        Body Goes Here
      </Card.Body>
      </section>
    )
  }
}
