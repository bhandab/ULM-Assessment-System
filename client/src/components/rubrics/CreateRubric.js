import React, { Component, Fragment, Spinner } from "react";
import {
  getSingleRubric,
  updateRubricCriteria,
  updateCellDescription
} from "../../actions/rubricsAction";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty } from "../../utils/isEmpty";
import { FormControl, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

class CreateRubric extends Component {
  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push("/login");
    }

    const rubricID = this.props.match.params.rubricID;
    this.props.getSingleRubric(rubricID, true);
  }

  onClickHandler = e => {
    console.log("clicked");
    console.log(e.target.name);
  };

  onChangehandler = e => {
    console.log("onChange");
    console.log(e.target.value);
    console.log(e.target.name);
  };

  updateCriteria = e => {
    const body = {
      criteriaDesc: e.target.value,
      criteriaID: e.target.name
    };

    this.props.updateRubricCriteria(this.props.match.params.rubricID, body);
  };

  updateCellDesc = e => {
    const body = {
      levelDesc: e.target.value,
      cellID: e.target.name
    };

    this.props.updateCellDescription(this.props.match.params.rubricID, body);
  };

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
          <div>Criteria</div>
        </td>
      );

      for (let i = 0; i < rubricDetails.scaleInfo.length; i++) {
        tableHeader.push(
          <th key={rubricDetails.scaleInfo[i].scaleID}>
            <div style={{ border: "none" }}>
              {rubricDetails.scaleInfo[i].scaleDescription}
            </div>
          </th>
        );
      }
      tableHeader = <tr>{tableHeader}</tr>;
      table.push(tableHeader);

      const tableRows = this.props.rubric.singleRubric.rubricDetails.table;
      for (let j = 0; j < tableRows.length; j++) {
        let cells = [];
        cells.push(
          <td key={rubricDetails.criteriaInfo[j].criteriaID}>
            <FormControl
              className="p-0 m-0"
              as="textarea"
              style={{ border: "none" }}
              defaultValue={rubricDetails.criteriaInfo[j].criteriaDescription}
              name={rubricDetails.criteriaInfo[j].criteriaID}
              onChange={this.updateCriteria.bind(this)}
            />
          </td>
        );

        const tableCols = tableRows[j];
        for (let k = 0; k < tableCols.length; k++) {
          cells.push(
            <td key={tableCols[k].cellID}>
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
        cells = <tr>{cells}</tr>;
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
        {this.props.rubric.loading ? (
          <Spinner className="mt-5 ml-5" animation="border" variant="primary" />
        ) : (
          <section className="panel important">
            <h2 className="align-middle">{rubricTitle}</h2>
            {table}
          </section>
        )}
        <Link to={"/admin/rubrics"}>
          <Button className="btn brn-primary mt-2 folat-right">
            Save Changes
          </Button>
        </Link>
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
