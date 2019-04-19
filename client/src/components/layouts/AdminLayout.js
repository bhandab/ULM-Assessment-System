import React, { Component, Fragment } from "react";
import { NavLink, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";

import "./Style.css";

class AdminLayout extends Component {

  state = {
    sidebar : false
  }
  

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.auth);
    if (!nextProps.auth.isAuthenticated || nextProps.auth.user.role !== "coordinator") {
      window.location.href = "/login";
    }
  }

  onLogoutClick = e => {
    e.preventDefault();
    console.log("Logout user!");
    this.props.logoutUser();
  };

  
    /* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
openNav = () => {
  if(!this.state.sidebar){
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
  this.setState({sidebar:true})
  }
  else{
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    this.setState({sidebar:false})

  
  }
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
// closeNav = () => {
//   document.getElementById("mySidebar").style.width = "0";
//   document.getElementById("main").style.marginLeft = "0";

// }
  /* Set the width of the sidebar to 250px and the left margin of the page content to 250px */

  
  render() {

    return (
      <Fragment>
        <header id="pageHeader">
        <h1 className = "justify-content-between">
          <button id = "disappear" className="openbtn" onClick={this.openNav}>&#9776; </button>
           <span className="ml-3">Coordinator</span>
        </h1>
          {/* <div id="main">
           <button id = "disappear" class="openbtn" onClick={openNav}>&#9776; </button>
          </div> */}
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
        <div id="mySidebar" className="sidebar">
            {/* <a href="javascript:void(0)" className="closebtn" onClick={this.closeNav}>&times;</a> */}
           <ul className="bordered m-3"style={{backgroundColor:'white'}}>
            <li className="dashboard">
              <NavLink to="/admin/cycles">Dashboard</NavLink>
            </li>
            <li className="assess-cycle">
              <NavLink to="/admin/cycles">Assessment Cycle</NavLink>
            </li>
            <li className="outcomes">
              <NavLink to="/admin/outcomes">Outcomes</NavLink>
            </li>
            <li className="perf-measures">
              <NavLink to="/admin/measures">Performance Measures</NavLink>
            </li>
            <li className="rubrics">
              <NavLink to="/admin/rubrics">Rubrics</NavLink>
            </li>
            <li className="evaluators">
            <NavLink to="/admin/evaluators">Evaluators</NavLink>
            </li>
            </ul>
          </div>
      </Fragment>
    );
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
