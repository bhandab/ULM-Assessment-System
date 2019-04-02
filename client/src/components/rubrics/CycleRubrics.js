import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Spinner} from 'react-bootstrap';
import {getRubricsGlobal} from '../../actions/rubricsAction';
import PropTypes from 'prop-types';


class AllRubrics extends Component {
    render(){
        let allRubrics = <Spinner animation="border" variant="primary" />;
        return(
            <section className="panel important">
                <h2>AllRubrics</h2>
                <ol>{allRubrics}</ol>
            </section>
        )
    }
}

AllRubrics.propTypes = {
    globalRubrics: PropTypes.object.isRequired,
    getRubricsGlobal: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    globalRubrics: state.globalRubrics
})
export default connect ( MapStateToProps ,{getRubricsGlobal} )(AllRubrics)