import React, { Component } from 'react';
import './Login.css';
import { connect } from 'react-redux';
import { loginUser } from '../../actions/authActions';
//import classnames from "classnames"
import PropTypes from 'prop-types'

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
        if (this.props.auth.isAuthenticated) {

            this.props.history.push("/admin");
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.auth.isAuthenticated) {
            if (nextProps.auth.user.role === "coordinator") {
                this.props.history.push("/admin");
            }
            else if (nextProps.auth.user.role === "evaluator") {
                console.log("gets here")
                this.props.history.push('/evaluator')
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
        const { errors } = this.state

        return (
            <div className="wrapper">
                <form className="form-signin">
                    <h2 className="form-signin-heading">Please Login</h2>
                    <input type="text" className="form-control" name="email" placeholder="Username" required="" autoFocus="" value={this.state.email} onChange={this.onChangeHandler.bind(this)} />
                    <input type="password" className="form-control" name="password" placeholder="Password" required="" value={this.state.password} onChange={this.onChangeHandler} />
                    <label className="checkbox">
                        <input type="checkbox" value="remember-me" id="rememberMe" name="rememberMe" /> Remember Me
                        </label>
                    <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={this.loginUser} >Log In</button>
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