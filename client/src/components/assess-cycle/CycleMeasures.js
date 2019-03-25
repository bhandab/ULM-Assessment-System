import React, {Component} from 'react';



class CycleMeasures extends Component {

    render(){
        console.log(this.props)
        let display = <p>Loading!!!</p>
        let list = null
        let headerTitle = null
        if(this.props.cycles.cycleMeasures !== null ){
            list = this.props.cycles.cycleMeasures.outcomes.map(outcome => {
                return <li key={outcome.outcomeID}>{outcome.outcomeName}</li>
            })
            let id = this.props.cycles.cycleMeasures.cycleIdentifier
            let header = this.props.cycles.cycles.cycles.find(item => {
                return item.cycleID == id
            })
            headerTitle = header.cycleName
        }
        
        return(
           <p></p> 
        )

    }

}

export default CycleMeasures;