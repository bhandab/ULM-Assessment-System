import React, { Component, Fragment } from 'react';
import {getSingleRubric} from '../../actions/rubricsAction';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';


class CreateRubric extends Component {

    componentDidMount(){
        const cycleID = this.props.match.params.cycleID
        const outcomeID = this.props.match.params.outcomeID
        const rubricID = this.props.match.params.rubricID
        this.props.getSingleRubric(cycleID, outcomeID, rubricID)
    }

    render(){
        console.log(this.props)
        return(
            <p>Create Rubric</p>
        )
    }
}

CreateRubric.propTypes = {
    getSingleRubric: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    rubric: state.rubric
})

export default connect(MapStateToProps, {getSingleRubric})(CreateRubric);