import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getAssessmentCycles, getCycleMeasures, createCycle } from '../../actions/assessmentCycleAction'
import PropTypes from "prop-types"
import { Link, Route, withRouter } from 'react-router-dom'

import CycleMeasures from './CycleMeasures'; 


class AssessmentCycle extends Component {


    componentDidMount() {
        this.props.getAssessmentCycles()
        
    }

    clickHandler = (e) => {

        
        this.props.getCycleMeasures(e.target.name)
        console.log(e.target.name)
    }

    submitHandler= (e) => {
        e.preventDefault()
        let value = e.target.cycleName.value
        this.props.createCycle({cycleTitle:value},this.props.history)
        window.location.reload()
        

    }

    renderMeasures = () => {
        //console.log("render Measures")
        console.log(this.props)
    }



    render() {

        //console.log(this.props)
        let cyclesList = null
        if (this.props.cycles.cycles === null) {
            cyclesList = <p>Loading Assessment Cycles </p>
        }
        else {
            cyclesList = this.props.cycles.cycles.cycles.map(cycle =>
                <li key={cycle.cycleID}><Link name={cycle.cycleID} onClick={this.clickHandler.bind(this)}
                    to={{
                        pathname: "/admin/cycles/"+cycle.cycleID,
                        
                    }}>
                    {cycle.cycleName}</Link>
                </li>
            )
        }

        //let cycleMeasures = null
        // if(cycle)

        //console.log(cyclesList)
        return (
            <Fragment>
                <section className="panel important">
                    <h2>Assessment Cycles</h2>
                    <ol>{cyclesList}</ol>
                </section>

                <section className="panel important">
                    <h2>Create New Cycle</h2>
                    <form onSubmit = {this.submitHandler.bind(this)}>
                    <input type="text" name="cycleName" placeholder = "Cycle Name"/> 
                    <button className = "btn btn-primary btn-sm" type="submit" value="Create">Create</button> 
                    </form>

                </section>
                <section className="panel important">
                                            
                    <Route 
                    path="/admin/cycles/1" 
                    render={(props) => <CycleMeasures {...this.props}/>}
                    />
                </section>
            </Fragment>
        )
    }
}

AssessmentCycle.propTypes = {
    getAssessmentCycles: PropTypes.func.isRequired,
    getCycleMeasures: PropTypes.func.isRequired,
    createCycle: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth,
    cycles: state.cycles,
    cycleMeasures: state.cycleMeasures
})

export default connect(
    mapStateToProps,
    { getAssessmentCycles, getCycleMeasures, createCycle })
    (AssessmentCycle);