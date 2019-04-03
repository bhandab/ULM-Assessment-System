import React, { Component, Fragment } from "react";
import { getSingleRubric } from "../../actions/rubricsAction";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty } from "../../utils/isEmpty";
import { FormControl, Jumbotron } from "react-bootstrap";

class CreateRubric extends Component {
  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push('/login')
    }

    const rubricID = this.props.match.params.rubricID;
    this.props.getSingleRubric(rubricID);
  }

  render() {
    console.log(this.props);

    let tableHeader = [];
    let table = [];
    let rubricTitle = null;
    let cols = 0;
    let rows = 0;

    if (isEmpty(this.props.rubric.singleRubric) === false) {
      console.log(this.props);

      const rubricDetails = this.props.rubric.singleRubric.rubricDetails;
      rubricTitle = this.props.rubric.singleRubric.rubricDetails.structureInfo
        .rubricTitle;
      rows = rubricDetails.criteriaInfo.length;
      cols = rubricDetails.scaleInfo.length;

      tableHeader.push(
        <td key="cross">
          <h3>Criteria</h3>
        </td>
      );
      
      for (let i = 0; i < rubricDetails.scaleInfo.length; i++) {
        tableHeader.push(
          <th key={rubricDetails.scaleInfo[i].scaleID}>
            <FormControl
              as="textarea"
              style={{ border: "none" }}
              defaultValue={rubricDetails.scaleInfo[i].scaleDescription}
            />
          </th>
        );
      }
      tableHeader = <tr>{tableHeader}</tr>;
      table.push(tableHeader);

      const tableRows = this.props.rubric.singleRubric.rubricDetails.table
      
      for(let j = 0; j < tableRows.length; j++){
        let cells = []
        cells.push(
          <td key={rubricDetails.criteriaInfo[j].criteriaID}>
            <FormControl className="p-0 m-0"
              as="textarea"
              style={{ border: "none" }}
              defaultValue={rubricDetails.criteriaInfo[j].criteriaDescription}
            />
          </td>
        );
        
        const tableCols =  tableRows[j]
        for(let k = 0; k < tableCols.length; k++){
          cells.push(
            <td key={tableCols[k].cellID}>
              <FormControl
                as="textarea"
                style={{ border: "none" }}
                defaultValue={tableCols[k].cellDescription}
              />
            </td>
          );
        }
        cells = <tr>{cells}</tr>;
        table.push(cells);


      }
      /*
      for (i = 0; i < rubricDetails.criteriaInfo.length; i++) {
        let cells = [];
        cells.push(
          <td key={rubricDetails.criteriaInfo[i].criteriaID}>
            <FormControl
              as="textarea"
              style={{ border: "none" }}
              defaultValue={rubricDetails.criteriaInfo[i].criteriaDescription}
            />
          </td>
        );
        let j;
        for (j = 0; j < rubricDetails.scaleInfo.length; j++) {
          let idx = (cols -1) * i + j;
          cells.push(
            <td key={rubricDetails.table[idx].cellID}>
              <FormControl
                as="textarea"
                style={{ border: "none" }}
                defaultValue={rubricDetails.table[idx].criteriaDescription}
              />
            </td>
          );
        }
        cells = <tr>{cells}</tr>;
        table.push(cells);
      }*/

      table = (
        <table className="table table-bordered m-0 p-0">
          <tbody>{table}</tbody>
        </table>
      );
    }
    return (
      <Fragment>
      <section className="panel important">
        <h2 className="align-middle">{rubricTitle}</h2>
        {table}
      </section>
      </Fragment>
    );
  }
}

CreateRubric.propTypes = {
  getSingleRubric: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const MapStateToProps = state => ({
  rubric: state.rubric,
  auth: state.auth,
  errors:state.errors
});

export default connect(
  MapStateToProps,
  { getSingleRubric }
)(CreateRubric);
