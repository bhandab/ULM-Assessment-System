import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';

import { setCurrentUser, logoutUser } from './actions/authActions';
import { Provider } from 'react-redux';
import store from './store';

import Login from './components/auth/Login'
import Admin from './components/users/Admin'
import Evaluator from './components/users/Evaluator'
import Register from './components/auth/Register'


import './App.css';

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwt_decode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
  // Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());

    // Redirect to login
    window.location.href = "/login"; 
  }
}



class App extends Component {
  render() {

    return (

      <Provider store={store}>
        <Router>
          <div className="App">
          <Switch>
            <Route path='/admin' component={Admin}></Route>
            <Route path='/evaluator' component={Evaluator}></Route>
            <Route path='/login' exact component={Login}></Route>
            <Route path="/register" exact component = {Register}></Route>
            <Route path='/' exact component={Login} />
            </Switch>
          </div>
        </Router>
      </Provider>

    );
  }
}

export default App;
