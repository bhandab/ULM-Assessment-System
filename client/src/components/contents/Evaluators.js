import React, { Component } from "react";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Form, Card, Button} from 'react-bootstrap';
import {getRegisteredEvaluators} from '../../actions/evaluatorAction';


class Evaluators extends Component {

    componentDidMount(){
        if (!this.props.auth.isAuthenticated || this.props.auth.user.role !== "coordinator"){
            this.props.history.push("/login")
        }
        this.props.getRegisteredEvaluators()
    }

    render() {
        console.log(this.props)

        let evaluatorsList = null

        if(this.props.evaluator.evaluators !== null ){
            this.props.evaluator.evaluators.evaluators.map(item => {
                return (
                    <li class="list-group-item">{item.name}</li>  
                )
            })

        }

        console.log(evaluatorsList)
        return (
            <section className="panel important">
                <Card style={{ width: '30rem', height: '15rem', float:"left", marginRight:"5%", marginLeft:"5%"}}>
                    <Card.Body>
                        <Card.Title>Existing Evaluators</Card.Title>
                        <Card.Text>
                            Evaluator List
                        </Card.Text>
                        <ul className="list-group">
                            {evaluatorsList}
                        </ul>
                        <Button variant="primary" className="float-right mt-3">Add Students</Button>
                    </Card.Body>
                </Card>

                <Card style={{width: '30rem', height: '15rem', marginLeft:'5%'}}>
                    <Card.Body>
                        <Card.Title>Invited Evaluators</Card.Title>
                        <Card.Text>
                            Student List
                        </Card.Text>
                        <Button variant="primary" className="float-right mt-3">Add Students</Button>
                    </Card.Body>
                </Card>
            </section>
            
        )
    }
}

Evaluators.propTypes = {
    getRegisteredEvaluators: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    evaluators: state.regsEvals,
    cycles: state.cycles,
    evaluator: state.evaluator,
    auth: state.auth
})

export default connect (MapStateToProps, {getRegisteredEvaluators}) (Evaluators)