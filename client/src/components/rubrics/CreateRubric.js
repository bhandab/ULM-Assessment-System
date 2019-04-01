import React, { Component, Fragment } from 'react';
import { getSingleRubric } from '../../actions/rubricsAction';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isEmpty } from '../../utils/isEmpty';
import { Form, FormControl } from 'react-bootstrap';


class CreateRubric extends Component {

    componentDidMount() {
        const cycleID = this.props.match.params.cycleID
        const outcomeID = this.props.match.params.outcomeID
        const rubricID = this.props.match.params.rubricID
        this.props.getSingleRubric(cycleID, outcomeID, rubricID)
    }

    render() {
        console.log(this.props)

        let tableHeader = []
        let table = []
        let rubricTitle = null
        let cols = 0
        let rows = 0

        if (isEmpty(this.props.rubric.singleRubric) === false) {
            console.log(this.props)

            const rubricDetails = this.props.rubric.singleRubric.rubricDetails
            rubricTitle = this.props.rubric.singleRubric.rubricDetails.structureInfo.rubricTitle
            cols = rubricDetails.criteriaInfo.length + 1
            rows = rubricDetails.scaleInfo.length + 1

            tableHeader.push(<td key="cross"><h3>Criteria</h3></td>)
            let i;
            for (i = 0; i < rubricDetails.scaleInfo.length; i++) {
                tableHeader.push(<th key={rubricDetails.scaleInfo[i].scaleID}><FormControl as="textarea" defaultValue={rubricDetails.scaleInfo[i].scaleDescription}></FormControl></th>)
            }
            tableHeader = (<tr>{tableHeader}</tr>)
            table.push(tableHeader)
            //for (i = 0; i < rubricDetails.table.length; i++) {

            //}
            for (i = 0; i < rubricDetails.criteriaInfo.length; i++) {
                let cells = []
                cells.push(<td key={rubricDetails.criteriaInfo[i].criteriaID}><FormControl as="textarea" defaultValue={rubricDetails.criteriaInfo[i].criteriaDescription} /></td>)
                let j
                for (j = 0; j < rubricDetails.scaleInfo.length; j++) {
                    let idx = (4 * i) + j
                    cells.push(<td key={rubricDetails.table[idx].cellID}><FormControl as="textarea" defaultValue={rubricDetails.table[idx].criteriaDescription} /></td>)
                }
                cells = (<tr>{cells}</tr>)
                table.push(cells)
            }



            table = (<table className="table table-bordered align-middle"><tbody>{table}</tbody></table>)
        }
        return (
            <section className="panel important">
                <h2 className="align-middle">{rubricTitle}</h2>
                {table}
            </section>
        )
    }
}

CreateRubric.propTypes = {
    getSingleRubric: PropTypes.func.isRequired
}

const MapStateToProps = state => ({
    rubric: state.rubric
})

export default connect(MapStateToProps, { getSingleRubric })(CreateRubric);