import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from '../../actions/authActions'

import './Style.css'

class AdminLayout extends Component {

    onLogoutClick = e => {
        e.preventDefault();
        console.log("Logout user!");
        this.props.logoutUser();
    };

    componentWillReceiveProps(nextProps) {
        console.log(nextProps.auth);
        if (!nextProps.auth.isAuthenticated) {
            window.location.href = "/login";
        }
    }
    render() {

        return (

            <Fragment>
                <header>
                    <h1>Admin Panel</h1>
                    <ul className="utilities">
                        <li className="users"><Link to="#">{this.props.auth.user.name}</Link></li>
                        <li className="logout warn"><Link to="/login"onClick={this.onLogoutClick.bind(this)}>Log Out</Link></li>
                    </ul>
                </header >


                <nav>
                    <ul className="main">
                        <li className="dashboard"><Link to="/admin" >Dashboard</Link></li>
                        <li className="outcomes"><Link to="/admin/outcomes">Outcomes</Link></li>
                        <li className="perf-measures"><Link to="/admin/measures">Performance Measures</Link></li>
                        <li className="rubrics"><Link to="/admin/rubrics" >Rubrics</Link></li>
                        <li className="assess-cycle"><Link to="/admin/cycles" >Assessment Cycle</Link></li>
                    </ul>
                </nav>

            </Fragment>



        )

    }
}

AdminLayout.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(
    mapStateToProps,
    { logoutUser }
)(AdminLayout);