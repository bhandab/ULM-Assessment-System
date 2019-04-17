import React, { Component, Fragment } from "react";
import {
  getSingleRubric,
  updateRubricCriteria,
  updateCellDescription,
  updateCriteriaWeight
} from "../../actions/rubricsAction";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { isEmpty } from "../../utils/isEmpty";
import { FormControl, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

class CreateRubric extends Component {
  componentDidMount() {
    if (
      !this.props.auth.isAuthenticated &&
      this.props.auth.user.role !== "coordinator"
    ) {
      this.props.history.push("/login");
    }

    const rubricID = this.props.match.params.rubricID;
    this.props.getSingleRubric(rubricID, true);
  }

  onClickHandler = e => {
    console.log("clicked");
    console.log(e.target.name);
  };

  // onChangehandler = e => {
  //   console.log("onChange");
  //   console.log(e.target.value);
  //   console.log(e.target.name);
  // };

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

  updateCriteriaWeight = e => {
    const body = {
      weight: e.target.value
    };
    const id = e.target.name;
    this.props.updateCriteriaWeight(this.props.match.params.rubricID, id, body);
  };

  saveChangesClick = e => {
    const criteriaWeight = [];
    const criteriaWtObj = [];
    let sum = 0;
    const weighted = this.props.rubric.singleRubric.rubricDetails.structureInfo
      .weighted;

    if (weighted === 1) {
      const length = this.props.rubric.singleRubric.rubricDetails.criteriaInfo
        .length;
      for (let i = 0; i < length; i++) {
        const id = "weight" + i;
        const wt = document.getElementById(id);
        const value = parseFloat(wt.value);
        //if (value !== "number" ){value = 0}
        criteriaWeight.push(value);
        sum += value;
        criteriaWtObj.push({
          criteriaID: wt.name,
          weight: value
        });
      }
      // console.log(criteriaWtObj)
      console.log(criteriaWeight);
      console.log(sum);
      if (sum < 100) {
        const alert = "The total criteria weight should be 100%";
        window.alert(alert);
      } else if (sum > 100) {
        window.alert("The total criteria weight cannot exceed 100%");
      } else {
        this.props.updateCriteriaWeight(
          this.props.match.params.rubricID,
          criteriaWtObj
        );
        this.props.history.push("/admin/rubrics");
      }
    }
  };

  render() {
    console.log(this.props);

    let tableHeader = [];
    let table = [];
    let rubricTitle = null;

    if (isEmpty(this.props.rubric.singleRubric) === false) {
      const weighted = this.props.rubric.singleRubric.rubricDetails
        .structureInfo.weighted;

      const rubricDetails = this.props.rubric.singleRubric.rubricDetails;
      rubricTitle = this.props.rubric.singleRubric.rubricDetails.structureInfo
        .rubricTitle;

      tableHeader.push(
        <th key="row1col1">
          <div>Criteria</div>
        </th>
      );

      for (let i = 0; i < rubricDetails.scaleInfo.length; i++) {
        tableHeader.push(
          <th key={"row1col" + (i + 2)}>
            <div style={{ border: "none" }}>
              {rubricDetails.scaleInfo[i].scaleDescription}
            </div>
          </th>
        );
      }
      if (weighted === 1) {
        tableHeader.push(
          <th
            className="weight"
            key={"row1col" + (rubricDetails.scaleInfo.length + 2)}
          >
            <div>Weight</div>
          </th>
        );
      }
      tableHeader = <tr key={"row" + 1}>{tableHeader}</tr>;
      table.push(tableHeader);

      const tableRows = this.props.rubric.singleRubric.rubricDetails.table;
      for (let j = 0; j < tableRows.length; j++) {
        let cells = [];
        cells.push(
          <td key={"row" + (j + 2) + "col1"}>
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
            <td key={"row" + (j + 2) + "col" + (k + 2)}>
              <FormControl
                as="textarea"
                defaultValue={tableCols[k].cellDescription}
                name={tableCols[k].cellID}
                onChange={this.updateCellDesc.bind(this)}
              />
            </td>
          );
        }

        if (weighted === 1) {
          cells.push(
            <td key={"wei" + rubricDetails.criteriaInfo[j].criteriaID}>
              <FormControl
                type="number"
                style={{ height: "100px" }}
                id={"weight" + j}
                defaultValue={rubricDetails.criteriaInfo[j].criteriaWeight}
                name={rubricDetails.criteriaInfo[j].criteriaID}
                min="0"
                max="100"
              />
            </td>
          );
        }
        cells = <tr key={"row" + (j + 2)}>{cells}</tr>;
        table.push(cells);
      }
      table = (
        <table className="table table-bordered m-0 p-0">
          <tbody>{table}</tbody>
        </table>
      );
      console.log(
        typeof this.props.rubric.singleRubric.rubricDetails.structureInfo
          .weighted
      );
    }
    console.log(this.props);
    return (
      <Fragment>
        {this.props.rubric.loading ? (
          <Spinner className="mt-5 ml-5" animation="border" variant="primary" />
        ) : (
          <section className="panel important">
            <h2 className="align-middle">{rubricTitle}</h2>
            {table}
            {/*<Link to={"/admin/rubrics"}>*/}
            <Button
              onClick={this.saveChangesClick.bind(this)}
              className="btn btn-primary mt-2 float-right"
            >
              Save Changes
            </Button>
            {/*</Link>*/}
          </section>
        )}
      </Fragment>
    );
  }
}

CreateRubric.propTypes = {
  getSingleRubric: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  updateRubricCriteria: PropTypes.func.isRequired,
  updateCellDescription: PropTypes.func.isRequired,
  updateCriteriaWeight: PropTypes.func.isRequired
};

const MapStateToProps = state => ({
  rubric: state.rubric,
  auth: state.auth,
  errors: state.errors
});

export default connect(
  MapStateToProps,
  {
    getSingleRubric,
    updateRubricCriteria,
    updateCellDescription,
    updateCriteriaWeight
  }
)(CreateRubric);
