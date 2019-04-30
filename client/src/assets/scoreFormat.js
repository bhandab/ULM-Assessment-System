import React from 'react';
import {CSVLink} from 'react-csv';

const CSVformat = (props) => {
    let csvData = [] 
    
    if(props.type+"" === "1"){
        csvData = [
        ["First Name", "Last Name", "Email","CWID","Score(%)"]
      ];    
    }
    if(props.type+"" === "0"){
        csvData = [
        ["First Name", "Last Name", "Email","CWID","Score(%)"]
      ];    
    }  
      return (
          <CSVLink filename={"score-sample-file.csv"} className="btn btn-info mt-3" data={csvData} target="_blank">File Sample</CSVLink>
    );
};

export default CSVformat;