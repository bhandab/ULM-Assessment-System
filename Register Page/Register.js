import React, {Component} from 'react';

const styling = {
    width: '30%',
    'margin-top': '10%',
    border: '2px solid white',
    padding: '20px',
    'border-radius': '3%'
}

const labelStyle = {
  color: 'white',
  'font-weight': 800,
  'font-family': 'cursive'
}
class Register extends Component {

  
  render() {

    return (

      <div>
        <div className = 'd-flex align-items-center'>
        <div className = 'container' style = {styling}>
          <form>
          <div class="form-group">
              <label for="exampleInputEmail1" style = {labelStyle}>Name</label>
              <input type="text" class="form-control" id="exampleInputEmail1" placeholder="Full Name" required/>
            </div>
            <div class="form-group">
              <label for="exampleInputEmail1" style = {labelStyle}>Email address</label>
              <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" required/>
            </div>
            <div class="form-group">
              <label for="exampleInputPassword1" style = {labelStyle}>Password</label>
              <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password" required/>
            </div>
            <div class="form-group">
              <label for="exampleInputPassword2" style = {labelStyle}>Confirm Password</label>
              <input type="password" class="form-control" id="exampleInputPassword2" placeholder="Confirm Password" required/>
            </div>
            <button type="submit" class="btn btn-outline-light btn-block btn-lg">Register</button>
          </form>
        </div>
        </div>
      </div>
    )
  }
}

export default Register;