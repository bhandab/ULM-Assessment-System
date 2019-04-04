import React, { Component, Fragment } from "react";
import { getSingleRubric, updateRubricCriteria, updateCellDescription } from "../../actions/rubricsAction";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty } from "../../utils/isEmpty";
import { FormControl, Spinner} from "react-bootstrap";
import './Rubric.css'

class CreateRubric extends Component {


  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push('/login')
    }

    const rubricID = this.props.match.params.rubricID;
    this.props.getSingleRubric(rubricID,true);
  }


  onClickHandler = (e) => {
    console.log("clicked")
    console.log(e.target.name)
  }

  onChangehandler = (e) => {
    console.log("onChange")
    console.log(e.target.value)
    console.log(e.target.name)
  }

  updateCriteria = (e) => {

    const body = {
      criteriaDesc: e.target.value,
      criteriaID: e.target.name
    }

    this.props.updateRubricCriteria(this.props.match.params.rubricID, body)

  }

  updateCellDesc = (e) => {

    const body = {
      levelDesc: e.target.value,
      cellID: e.target.name
    }

    this.props.updateCellDescription(this.props.match.params.rubricID, body)

  }


  render() {

    let tableHeader = [];
    let table = [];
    let rubricTitle = null;

    if (isEmpty(this.props.rubric.singleRubric) === false) {

      const rubricDetails = this.props.rubric.singleRubric.rubricDetails;
      rubricTitle = rubricDetails.structureInfo.rubricTitle;
      //rows = rubricDetails.criteriaInfo.length;
      //cols = rubricDetails.scaleInfo.length;

      tableHeader.push(
        <th key="cross">
          <h3>Criteria</h3>
        </th>
      );

      for (let i = 0; i < rubricDetails.scaleInfo.length; i++) {
        tableHeader.push(
          <th key={i+""+rubricDetails.scaleInfo[i].scaleID}>
            <h3
              style={{ border: "none" }}
            >{rubricDetails.scaleInfo[i].scaleDescription}</h3>
          </th>
        );
      }
      tableHeader = <tr key={"row"+1}>{tableHeader}</tr>;
      table.push(tableHeader);
      tableHeader = []

      const tableRows = this.props.rubric.singleRubric.rubricDetails.table

      for (let j = 0; j < tableRows.length; j++) {
        let cells = []
        cells.push(
          <td key={rubricDetails.criteriaInfo[j].criteriaID}>
            <FormControl className="p-0 m-0"
              as='textarea'
              style={{ border: "none" }}
              defaultValue={rubricDetails.criteriaInfo[j].criteriaDescription}
              name={rubricDetails.criteriaInfo[j].criteriaID}
              onChange={this.updateCriteria.bind(this)}
            />
          </td>
        );
        // console.log(cells);
        const tableCols = tableRows[j]
        for (let k = 0; k < tableCols.length; k++) {
          cells.push(
            <td key={tableCols[k].cellID+""+j}>
              <FormControl
                as="textarea"
                style={{ border: "none" }}
                defaultValue={tableCols[k].cellDescription}
                name={tableCols[k].cellID}
                onChange={this.updateCellDesc.bind(this)}
              />
            </td>
          );
        }
        cells = <tr key={"row"+j+2}>{cells}</tr>;
        table.push(cells);


      }
      table = (
        <table className="table table-bordered m-0 p-0">
          <tbody>{table}</tbody>
        </table>
      );

    }
    return (


      <Fragment>
        {this.props.rubric.loading ? <Spinner className="mt-5 ml-5" animation='border' variant="primary"></Spinner> : 
          <section className="panel important">
          <h2 className="align-middle">{rubricTitle}</h2>
          {table}
        </section>}
      </Fragment>


    );
  }
}

CreateRubric.propTypes = {
  getSingleRubric: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  updateRubricCriteria: PropTypes.func.isRequired,
  updateCellDescription: PropTypes.func.isRequired
};

const MapStateToProps = state => ({
  rubric: state.rubric,
  auth: state.auth,
  errors: state.errors
});

export default connect(
  MapStateToProps,
  { getSingleRubric, updateRubricCriteria, updateCellDescription }
)(CreateRubric);
