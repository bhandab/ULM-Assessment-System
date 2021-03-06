
import React, { Component, Fragment } from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";
import {Link} from 'react-router-dom';

import './Style.css'


class EvaluatorLayout extends Component {


    componentWillReceiveProps(nextProps) {
        if (!nextProps.auth.isAuthenticated || nextProps.auth.user.role !== "evaluator") {
            window.location.href = "/login";
        }
    }

    onLogoutClick = e => {
        e.preventDefault();
        this.props.logoutUser();
    };

    render() {
        return (
            <Fragment>
                <header>
                    <h1>Evaluator Panel</h1>
                    <ul className="utilities">
                        <li className="users"><Link to="/evaluator/profile">{this.props.auth.user.name}</Link></li>
                        <li className="logout warn"><Link to="/" onClick={this.onLogoutClick.bind(this)}>Log Out</Link></li>
                    </ul>
                </header>

            </Fragment>
        )
    }
}

EvaluatorLayout.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const MapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    MapStateToProps,
    { logoutUser }
)(EvaluatorLayout);

