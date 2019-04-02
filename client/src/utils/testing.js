import React, { Component } from 'react'


class Test extends Component {


    onSubmitHandle =(e) => {
        e.preventDefault()
        console.log(e.target.browser.dataset)
    }
    render() {

        return (
            <form name="datalist" method="get" onSubmit={this.onSubmitHandle.bind(this)}>
                <input list="browsers" name="browser" />
                <datalist id="browsers">
                    <option dataset-value="1" value="IE" />
                    <option data-value="FX" value="Firefox" />
                    <option data-value="C" data-value="1"value="Chrome" />
                    <option data-value="O"value="Opera" />
                    <option data-value="S" value="Safari" />
                </datalist>
                <input type="submit" />
            </form>
        )
    }

}

export default Test