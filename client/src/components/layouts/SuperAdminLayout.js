import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";

import "./Style.css";

class SuperAdminLayout extends Component {
  

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.auth);
    if (!nextProps.auth.isAuthenticated || nextProps.auth.user.role !== "superuser") {
      window.location.href = "/login";
    }
  }

  onLogoutClick = e => {
    e.preventDefault();
    console.log("Logout user!");
    this.props.logoutUser();
  };
  
  render() {
    return (
      <Fragment>
        <header>
          <h1>Super Admin</h1>
          <ul className="utilities">
            <li className="users">
              <Link to="#">{this.props.auth.user.name}</Link>
            </li>
            <li className="logout warn">
              <Link to="/login" onClick={this.onLogoutClick.bind(this)}>
                Log Out
              </Link>
            </li>
          </ul>
        </header>

      </Fragment>
    );
  }
}

SuperAdminLayout.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser }
)(SuperAdminLayout);