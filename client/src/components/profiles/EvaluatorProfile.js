import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Card,
  ListGroup,
  Form,
  InputGroup,
  Button,
  Modal
} from "react-bootstrap";
import { updateEvalName, updateEvalPassword } from "../../actions/authActions";
import { toastr } from "react-redux-toastr";

class EvaluatorProfile extends Component {
  state = {
    updateName: false,
    updatePass: false,
    oldPassword: "",
    password1: "",
    password2: ""
  };

  changeName = e => {
    e.preventDefault();
    const body = {
      firstName: e.target.fName.value,
      lastName: e.target.lName.value
    };
    this.props.updateEvalName(body);
    this.setState({ updateName: false });
  };

  passwordUpdate = () => {
    if ((this.state.password1 !== "")) {
      if (this.state.password1 === this.state.password2) {
        const body = {
          oldPassword: this.state.oldPassword,
          password: this.state.password1,
          password2: this.state.password2
        };
        this.props.updateEvalPassword(body)
        this.setState({updatePass:false})
      } else {
        toastr.error("Password Error!", "Passwords Must Match!");
      }
    }
    else {
      toastr.error(
        "Password Error!",
        "Password Cannot Be Empty!" )
    }
  };

  render() {
    console.log(this.props);
    return (
      <section className="panel important">
        <Card>
          <Card.Header as="h1" className="text-center">
            Coordinator Profile
          </Card.Header>
          <Card.Body>
            <ListGroup>
              <ListGroup.Item>
                {!this.state.updateName ? (
                  <h3>
                    {" "}
                    Name: {this.props.auth.user.name}
                    <button
                      style={{ border: "none", background: "none" }}
                      onClick={() => this.setState({ updateName: true })}
                      className="outcome-edit float-right"
                    />
                  </h3>
                ) : null}

                {!this.state.updateName ? null : (
                  <Form className="ml-2" onSubmit={this.changeName.bind(this)}>
                    <InputGroup className="row">
                      <InputGroup className="col-5">
                        <InputGroup.Prepend>
                          <InputGroup.Text>First Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          name="fName"
                          placeholder="eg. John"
                          required
                        />
                      </InputGroup>
                      <InputGroup className="col-5">
                        <InputGroup.Prepend>
                          <InputGroup.Text>Last Name</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          name="lName"
                          placeholder="eg.Doe"
                          required
                        />
                      </InputGroup>
                    </InputGroup>
                    <Button
                      type="submit"
                      variant="success"
                      className="mt-2 ml-3"
                    >
                      <i className="fas fa-check text-light" />
                    </Button>
                    <Button
                      variant="danger"
                      className="mt-2"
                      onClick={() => this.setState({ updateName: false })}
                    >
                      <i className="fas fa-times text-light" />
                    </Button>
                  </Form>
                )}
              </ListGroup.Item>
              <ListGroup.Item>
                <h3>Email: {this.props.auth.user.email}</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <h3>Role: {this.props.auth.user.role}</h3>
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>
          <Card.Footer>
            <Button
              className="float-right"
              onClick={() => this.setState({ updatePass: true })}
            >
              Update Password
            </Button>
          </Card.Footer>
        </Card>

        <Modal
          show={this.state.updatePass}
          onHide={() => this.setState({ updatePass: false })}
          centered
        >
          <Modal.Header closeButton>
            <h2> Update Password</h2>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-0">Current Password</p>
            <input
              type="password"
              className="form-control mb-0"
              name="password"
              placeholder="Password"
              required
              onChange={(e)=>this.setState({oldPassword:e.target.value})}
            />
            <p className="mt-0" style={{ fontSize: "12px", color: "red" }}>
              {this.props.errors.password}
            </p>

            <p className="mb-0">New Password</p>
            <input
              type="password"
              value={this.state.password1}
              onChange={e => this.setState({ password1: e.target.value })}
              className="form-control mb-0"
              name="password2"
              placeholder="Confirm Password"
              required
            />

            <p className="mb-0">Confirm New Password</p>
            <input
              type="password"
              value={this.state.password2}
              onChange={e => this.setState({ password2: e.target.value })}
              className="form-control mb-0"
              name="password2"
              placeholder="Confirm Password"
              required
            />
            <p className="mt-0 " style={{ fontSize: "12px", color: "red" }}>
              {this.state.password1 !== this.state.password2
                ? "Passwords Must Match!"
                : null}
              {this.props.errors.password2}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="success"
              onClick={this.passwordUpdate}
              className="float-right"
            >
              Update
            </Button>
            <Button variant="danger" className="float-right">
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </section>
    );
  }
}

const MapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  outcomes: state.outcomes,
  measures: state.measures
});

export default connect(
  MapStateToProps,
  {
    updateEvalName,
    updateEvalPassword
  }
)(EvaluatorProfile);
