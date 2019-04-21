import React, { Component } from 'react';
import './Login.css';
import { connect } from 'react-redux';
import { loginUser } from '../../actions/authActions';
import {isEmpty} from '../../utils/isEmpty';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';




class Login extends Component {

    state = {
        email: "",
        password: "",
        errors: {}

    }

    loginUser = (e) => {

        e.preventDefault();

        const userData = {
            email: this.state.email,
            password: this.state.password
        }

        this.props.loginUser(userData)


    }

    componentDidMount() {
        // If logged in and user navigates to Login page, should redirect them to dashboard
        if (this.props.auth.isAuthenticated && this.props.auth.user==="coordinator") {

            this.props.history.push("/admin/cycles");
        }

        else if (this.props.auth.isAuthenticated && this.props.auth.user === "evaluator") {
            this.props.history.push("/evaluator")
        }

        else if (this.props.auth.isAuthenticated && this.props.auth.user.role === "superuser"){
            this.props.history.push("/superuser")
        }

        else{
            this.props.history.push("/login")
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
            if (nextProps.auth.user.role === "coordinator") {
                this.props.history.push("/admin");
            }
            else if (nextProps.auth.user.role === "evaluator") {
                this.props.history.push('/evaluator/evaluate')
            }

        }

        if (nextProps.errors) {
            this.setState({
                errors: nextProps.errors
            });
        }
    }

    onChangeHandler = e => {
        this.setState({ [e.target.name]: e.target.value })
    }

    render() {
        
        return (
            <div className="wrapper">
                <form className="form-signin">
                    <h2 className="form-signin-heading">Please Login</h2>

                    <input type="text" className="form-control" name="email" placeholder="Username" required="" autoFocus="" value={this.state.email} onChange={this.onChangeHandler.bind(this)} />
                    <p className="mt-0" style={{ fontSize: '12px', color: 'red' }}>{this.props.errors.email}</p>

                    <input type="password" className="form-control" name="password" placeholder="Password" required="" value={this.state.password} onChange={this.onChangeHandler} />
                    <p className="mt-0" style={{ fontSize: '12px', color: 'red' }}>{this.props.errors.password}</p>

                    <label className="checkbox">
                        <input type="checkbox" value="remember-me" id="rememberMe" name="rememberMe" /> Remember Me
                        </label>
                    <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={this.loginUser} >Log In</button>
                    <Link id = "register" to="/register">Register</Link>
                </form>
            </div>
        );
    }
}

Login.propTypes = {
    loginUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired

}

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});

export default connect(
    mapStateToProps,
    { loginUser }
)(Login);