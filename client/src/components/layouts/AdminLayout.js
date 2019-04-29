import React, { Component, Fragment } from "react";
import { NavLink, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Logo from '../../assets/warhawk-logo.png';
import { logoutUser, loginAsEval } from "../../actions/authActions";
import {Button} from 'react-bootstrap'
//Silly commit

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

  actAsEval = () => {
    console.log("clicked")
    this.props.loginAsEval()
  }

  
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
        <header id="pageHeader" className="noprint">
        <h1 className = "justify-content-between">
          <button id = "disappear" className="openbtn" onClick={this.openNav}>&#9776; </button>
           <span className="ml-3 mt-5"><strong>Coordinator</strong></span>
        </h1>
          <ul className="utilities">
            <li className="mr-5">
              <Button onClick={this.actAsEval}>Evaluator</Button>
            </li>
            <li className="users">
              <Link to="/admin/profile">{this.props.auth.user.name}</Link>
            </li>
            <li className="logout warn">
              <Link to="/login" onClick={this.onLogoutClick.bind(this)}>
                Log Out
              </Link>
            </li>
          </ul>
        </header>
        <div id="mySidebar" className="sidebar noprint">
        <img className = "ml-3" style={{height: '100px', width: '200px'}}src= {Logo} alt="ULM LOGO"/>
            {/* <a href="javascript:void(0)" className="closebtn" onClick={this.closeNav}>&times;</a> */}
           <ul className="bordered m-3"style={{backgroundColor:'white'}}>
            <li className="dashboard">
              <NavLink to="/admin/dashboard"><i className="fas fa-chalkboard"></i>Dashboard</NavLink>
            </li>
            <li className="assess-cycle">
              <NavLink to="/admin/cycles"><i className="fas fa-recycle "></i>Assessment Cycle</NavLink>
            </li>
            <li className="rubrics">
              <NavLink to="/admin/rubrics"><i className="fas fa-th"></i>Rubrics</NavLink>
            </li>
            <li className="evaluators">
            <NavLink to="/admin/evaluators"><i className="fas fa-user-tie"></i>Evaluators</NavLink>
            </li>
            <li className="pastCycles">
            <NavLink to="/admin/pastCycles"><i className="fas fa-fast-backward"></i>Past Cycles</NavLink>
            </li>
            </ul>
          </div>
      </Fragment>
    );
  }
}

AdminLayout.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  loginAsEval: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser, loginAsEval }
)(AdminLayout);
