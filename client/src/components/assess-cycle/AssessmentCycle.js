import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getAssessmentCycles, createCycle, updateCycleName } from '../../actions/assessmentCycleAction';
import PropTypes from "prop-types";
import { Link} from 'react-router-dom';
import {Spinner, Button, Modal, Form} from 'react-bootstrap';


class AssessmentCycle extends Component {

    state = {
        show : false,
        editShow: false,
        cycleName:"",
        cycleID:null
    }

    componentDidMount() {
        if(!this.props.auth.isAuthenticated){
            this.props.history.push('/login')
        }
        this.props.getAssessmentCycles()
        
    }

    clickHandler = e => {
        console.log(e.target)
    }

     submitHandler= (e) => {
        e.preventDefault()
        let value = e.target.cycleName.value
        this.props.createCycle({cycleTitle:value},this.props.history)

    }

    saveChangesHandler = e => {
        e.preventDefault()
        const value = e.target.cycleName.value
        this.props.updateCycleName(this.state.cycleID, { cycleTitle: value })
        this.setState({ cycleName: "", cycleID: null, editShow: false })
    }

  
    modalShow = () => {
        this.setState({ show: true })
    }

    modalHide = () => {
        this.setState({show:false})
    }

    editShow = (e) => {
        console.log(e.target.value)
        this.setState({ cycleName: e.target.value, cycleID: e.target.name, editShow: true  })
    }
    
    editHide = () => {
        this.setState({ editShow: false })
    }



    render() {

      
        let cyclesList = null
        if (this.props.cycles.cycles === null) {
            cyclesList = <Spinner animation='border' variant="primary"></Spinner>
        }
        else {

            cyclesList = this.props.cycles.cycles.cycles.map(cycle =>
                <li key={cycle.cycleID}><Link params={cycle.cycleName} name={cycle.cycleID}
                    to={{
                        pathname: "/admin/cycles/cycle/"+cycle.cycleID,
                    }}>
                    {cycle.cycleName}</Link> 
                    <button style = {{border:"none", background:"none"}}
                    name={cycle.cycleID} value={cycle.cycleName} 
                    onClick={this.editShow.bind(this)} 
                    className="outcome-edit ml-2"></button>
                </li>
            )
        }

       

        
        return (
            <Fragment>
                <section className="panel important" >
                    <h2>Assessment Cycles</h2>
                    <ol>{cyclesList}</ol>
                    <br></br>
                    <Button onClick={this.modalShow}>Create New Cycle</Button>
                </section>

                <Modal size="lg" show = {this.state.show} onHide = {this.modalHide}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Create New Assessment Cycle
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={this.submitHandler.bind(this)}>
                            <Form.Control name="cycleName" placeholder="Cycle Name"></Form.Control>
                            <Button className="mt-3 float-right" type="submit" onClick={this.modalHide}>Create</Button>
                        </Form>
                    </Modal.Body>
                    </Modal>
                <Modal show={this.state.editShow} onHide={this.editHide}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Edit Cycle Name
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={this.saveChangesHandler.bind(this)}>
                            <Form.Control name="cycleName" defaultValue={this.state.cycleName}/>
                            <Button className="mt-3 float-right" type="submit" onClick={this.modalHide}>Save Changes</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
                
            </Fragment>
        )
    }
}

AssessmentCycle.propTypes = {
    getAssessmentCycles: PropTypes.func.isRequired,
    createCycle: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    updateCycleName: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth,
    cycles: state.cycles,
})

export default connect(mapStateToProps, { getAssessmentCycles, createCycle, updateCycleName }) (AssessmentCycle);