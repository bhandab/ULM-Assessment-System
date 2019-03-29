import React, { Component } from 'react';
import "./Register.css"



class Register extends Component {


    render() {

        return (

            <div id ="center">
                <div className='d-flex align-items-center'>
                    <div className='container' className="styling">
                        <form>
                            <h2>Evaluator Registration</h2>
                            <div className="form-group">
                                <label for="exampleInputEmail1" className="labelStyle">Name</label>
                                <input type="text" className="form-control" id="exampleInputEmail1" placeholder="Full Name" required />
                            </div>
                            <div className="form-group">
                                <label for="exampleInputEmail1" className = "labelStyle">Email address</label>
                                <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" required />
                            </div>
                            <div className="form-group">
                                <label for="exampleInputPassword1" className="labelStyle">Password</label>
                                <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Password" required />
                            </div>
                            <div className="form-group">
                                <label for="exampleInputPassword2" className="labelStyle">Confirm Password</label>
                                <input type="password" className="form-control" id="exampleInputPassword2" placeholder="Confirm Password" required />
                            </div>
                            <button type="submit" className="btn btn-outline-light btn-block btn-lg">Register</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default Register;