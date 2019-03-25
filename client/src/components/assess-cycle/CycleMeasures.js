import React, {Component, Fragment} from 'react';



class CycleMeasures extends Component {

    render(){
        console.log(this.props)
        let display = null
        let list = null
        //let headerTitle = null
        if(this.props.cycles.cycleMeasures !== null ){
            list = this.props.cycles.cycleMeasures.outcomes.map(outcome => {
                return <li key={outcome.outcomeID}>{outcome.outcomeName}</li>
            })
            console.log(list);
            let id = this.props.cycles.cycleMeasures.cycleIdentifier
            console.log(id)
            let header = this.props.cycles.cycles.cycles.find(item => {
                return "'"+item.cycleID+"'" === id
            })
            console.log(header)
            display = header.cycleName
            //console.log(headerTitle)
        }

        /*else{
            display = <p>Loading!!!</p>
        }*/

                
        return(
            <section className="panel important">
                <h3>{display}</h3>
                <ol>{list}</ol>
            </section>
            
        )

    }

}

export default CycleMeasures;