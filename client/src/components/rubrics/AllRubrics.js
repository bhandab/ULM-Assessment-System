import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Spinner} from 'react-bootstrap';
import {getRubricsGlobal} from '../../actions/rubricsAction';
import PropTypes from 'prop-types';
import {isEmpty} from '../../utils/isEmpty'


class AllRubrics extends Component {

    componentDidMount(){
        if(!this.props.auth.isAuthenticated){
            this.props.history.push('/login')
        }

        this.props.getRubricsGlobal()
    }
    
    render(){
        console.log("all rubrics")
        console.log(this.props)
        let allRubrics = <Spinner animation="border" variant="primary" />;

        if(isEmpty(this.props.rubric.globalRubrics)=== false){
            allRubrics = this.props.rubric.globalRubrics.map(rubric => {
                return(<li key = {rubric.rubricID}>{rubric.rubricTitle}</li>)
            })
        }


        return(
            <section className="panel important">
                <h2>All Rubrics</h2>
                <hr/>
                <ol>{allRubrics}</ol>
            </section>
        )
    }
}

AllRubrics.propTypes = {
    getRubricsGlobal: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
}

const MapStateToProps = state => ({
    globalRubrics: state.globalRubrics,
    auth: state.auth,
    rubric: state.rubric
})
export default connect ( MapStateToProps ,{getRubricsGlobal} )(AllRubrics)