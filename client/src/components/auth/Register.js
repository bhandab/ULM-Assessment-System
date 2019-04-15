import React, { Component } from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {registerUser} from '../../actions/authActions'
import './Login.css'
import {Link} from 'react-router-dom'
 



class Register extends Component {

    state = {
        email:"",
        password:"",
        cpassword:""
    }

    registerhandler = (e) => {
        e.preventDefault();

        const userData = {
            email: e.target.email.value,
            password: e.target.password.value,
            password2: e.target.password2.value,
            name: e.target.userName.value,
            program:"none"
        }
        this.props.registerUser(userData,this.props.history)
        console.log(userData)
    }



    render() {
        console.log(this.props)
        return (

            <div className="wrapper">
                <form className="form-signin" onSubmit={this.registerhandler.bind(this)}>
                    <h2 className="form-signin-heading">Register</h2>
                    
                    <p className="mb-0">Name</p>
                    <input type="text" className="form-control mb-0" name="userName" placeholder="Username" required="" autoFocus="" />
                    <p className="mt-0" style={{fontSize:'12px', color:'red'}}>{this.props.errors.name}</p>

                    <p className="mb-0">Email</p>
                    <input type="email" className="form-control mb-0" name="email" placeholder="Username" required="" autoFocus=""/>
                    <p className="mt-0" style={{ fontSize: '12px', color: 'red' }}>{this.props.errors.email}</p>

                    <p className="mb-0">Password</p>
                    <input type="password" className="form-control mb-0" name="password" placeholder="Password" required=""  />
                    <p className="mt-0" style={{ fontSize: '12px', color: 'red' }}>{this.props.errors.password}</p>

                    <p className="mb-0">Confirm Password</p>
                    <input type="password" className="form-control mb-0" name="password2" placeholder="Confirm Password" required="" />
                    <p className="mt-0 mb-4" style={{ fontSize: '12px', color: 'red' }}>{this.props.errors.password2}</p>

                    <button className="btn btn-lg btn-primary btn-block" type="submit">Register</button>
                    <Link className="float-right" to="/login">Login</Link>
                </form>
            </div>
        )
    }
}

Register.propTypes = {
    registerUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
}

const MapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
})

export default connect(MapStateToProps, {registerUser})(Register);