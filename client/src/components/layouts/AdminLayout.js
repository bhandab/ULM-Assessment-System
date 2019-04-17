import React, { Component, Fragment } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authActions";

import "./Style.css";

class AdminLayout extends Component {
  

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

  /* Set the width of the sidebar to 250px and the left margin of the page content to 250px */

  
  render() {

    // function openNav() {
    //   document.getElementById("mySidebar").style.width = "250px";
    //   // document.getElementById("main").style.marginLeft = "250px";
    //   document.getElementById("disappear").style.display = "none";
    
    // }
    
    // function closeNav() {
    //   document.getElementById("mySidebar").style.width = "0";
    //   // document.getElementById("main").style.marginLeft = "0";
    //   document.getElementById("disappear").style.display = "inline";
    
    // }

    /* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}


    return (
      <Fragment>
        <header>
        <h1 className = "justify-content-between">
          <button id = "disappear" class="openbtn" onClick={openNav}>&#9776; </button>
           <span> Admin Panel</span>
        </h1>
        {/* <div id="main">

       


        </div> */}
           
          <div id="mySidebar" className="sidebar" style={{backgroundColor:'grey'}}>
            <a href="javascript:void(0)" className="closebtn" onClick={closeNav}>&times;</a>
           <ul className="bordered m-3"style={{backgroundColor:'white'}}>
            <li className="dashboard">
              <Link to="/admin/cycles">Dashboard</Link>
            </li>
            <li className="outcomes">
              <Link to="/admin/outcomes">Outcomes</Link>
            </li>
            <li className="perf-measures">
              <Link to="/admin/measures">Performance Measures</Link>
            </li>
            <li className="rubrics">
              <Link to="/admin/rubrics">Rubrics</Link>
            </li>
            <li className="assess-cycle">
              <Link to="/admin/cycles">Assessment Cycle</Link>
            </li>
            <li className="evaluators">
            <Link to="/admin/evaluators">Evaluators</Link>
            </li>
            </ul>
          </div>
         

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

// /* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
// function openNav() {
//   document.getElementById("mySidebar").style.width = "250px";
//   document.getElementById("main").style.marginLeft = "250px";
//   document.getElementById("disappear").style.display = "none";

// }

// /* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
// function closeNav() {
//   document.getElementById("mySidebar").style.width = "0";
//   document.getElementById("main").style.marginLeft = "0";
//   document.getElementById("disappear").style.display = "block";

// }

//     return (
//       <div>
//       <div id="mySidebar" className="sidebar">
//   <a href="javascript:void(0)" className="closebtn" onClick={closeNav}>&#9776;</a>
//   <a href="#">Dashboard</a>
//   <a href="#">Outcomes</a>
//   <a href="#">Performance Measures</a>
//   <a href="#">Assessment Cycles</a>
//   <a href="#">Evaluator</a>
// </div>
  

// <div id="main">
//   <button id = "disappear" class="openbtn" onClick={openNav}>&#9776; </button>
// </div>
// </div>
