import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { getOutcomes } from "../../actions/outcomesAction";
import PropTypes from "prop-types";

class Outcomes extends Component {

  state = {
    outcomes : localStorage.getItem('outcomes')
  }
  
  
  componentDidMount() {
    console.log(this.props);
  }

  onSubmitHandler (e){
    e.preventDefault()
    const outcome = e.target.parentElement.outcome.value
    const prevOutcomes = this.state.outcomes
    let outcomes = []
    if(prevOutcomes != null){
    outcomes = [...JSON.parse(this.state.outcomes)]
    }
    outcomes.push(outcome)
    localStorage.setItem('outcomes',JSON.stringify(outcomes))
    this.setState({outcomes:outcomes})
    
  } 

  render() {

    let outcomes = this.state.outcomes
    let outcomesList = null
    if( outcomes!=null ){
      outcomes = this.JSON.parse(outcomes)
      outcomesList = outcomes.map((outcome,index) => {
        return <li key={index}>{outcome}</li>
      })
      outcomesList = <ol>{outcomesList}</ol>
    }
    else {
      outcomesList = <h3>No items at the moment!</h3>
    }

    console.log(this.props)
    return (
      <Fragment>
        <section className = "panel important">
            <h2> List of Outcomes </h2>
            <hr/>
            {outcomesList}
        </section>

        <section className="panel important">
            <h2>Add Outcomes</h2>
            <form>
              <input type = "text" name="outcome" placeholder="Enter the outcome"/>
              <input type = "submit" onSubmit = {this.onSubmitHandler.bind}/>
            </form>
        </section>
         
      </Fragment>
     
    )
  }
}

Outcomes.propTypes = {
  getOutcomes: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  outcomes: state.outcomes
});

export default connect(
  mapStateToProps,
  { getOutcomes }
)(Outcomes);
