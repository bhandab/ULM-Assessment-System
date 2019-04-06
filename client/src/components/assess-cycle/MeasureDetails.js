import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from "prop-types";



class MeasureDetails extends Component {

    state = {
        show: false,
    }

    componentDidMount(){
        if (!this.props.auth.isAuthenticated) {
            this.props.history.push('/login')
        }
    }

   

    render() {
        console.log(this.props)

        return (
            <Fragment>
                <section className="panel important">
                <p>Measure Details</p>
                </section>
            </Fragment>
        )
    }

}

MeasureDetails.propTypes = {
    auth: PropTypes.object.isRequired
}

const MapStateToProps = state => ({
    auth: state.auth
})
export default connect(MapStateToProps)(MeasureDetails);