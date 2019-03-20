import React, {Component ,Fragment} from 'react'

class PerfMeasures extends Component {

    state = {
        perfMeasures: localStorage.getItem('perfMeasures')
    }


    componentDidMount() {
        console.log(this.props);
    }

    onSubmitHandler(e) {
        e.preventDefault()
        const perfMeasure = e.target.parentElement.perfMeasure.value
        const prevOutcomes = this.state.perfMeasures
        let perfMeasures = []
        if (prevOutcomes != null) {
            perfMeasures = [...JSON.parse(this.state.perfMeasures)]
        }
        perfMeasures.push(perfMeasure)
        localStorage.setItem('perfMeasures', JSON.stringify(perfMeasures))
        this.setState({ perfMeasures: perfMeasures })

    }

    render() {

        let perfMeasures = this.state.perfMeasures
        let outcomesList = null
        if (perfMeasures != null) {
            perfMeasures = this.JSON.parse(perfMeasures)
            outcomesList = perfMeasures.map((perfMeasure, index) => {
                return <li key={index}>{perfMeasure}</li>
            })
            outcomesList = <ol>{outcomesList}</ol>
        }
        else {
            outcomesList = <h3>No items at the moment!</h3>
        }

        console.log(this.props)
        return (
            <Fragment>
                <section className="panel important">
                    <h2> List of Performance Measures </h2>
                    <hr />
                    {outcomesList}
                </section>

                <section className="panel important">
                    <h2>Add Outcomes</h2>
                    <form>
                        <input type="text" name="perfMeasure" placeholder="Enter the measure" />
                        <input type="submit" onSubmit={this.onSubmitHandler.bind} />
                    </form>
                </section>

            </Fragment>

        )
    }
}

export default PerfMeasures;