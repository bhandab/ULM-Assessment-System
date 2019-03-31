import React, { Component } from 'react';
import './coordinator.css';
import PropTypes from 'prop-types';

class coordinator extends Component {
    state = {
      email: "person@example.com",
      department: "College of Business",
      name: "Cordova",
      id: {},
    }
     
    resetHandler = e => {
      e.preventDefault();
      
    }
    render() {

    return (
        <div  className="box">
            <div className="email, el"><label>Email:</label>{this.state.email}</div>
            <div className="dept, el"><label>Department:</label>{this.state.department}</div>
            <div className="name, el"><label>Name:</label>{this.state.name}</div>
            <button className="reset" onClick={this.resetHandler}>Reset Password</button>
      </div>
    );
  }
}

export default coordinator;