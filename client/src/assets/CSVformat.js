import React from 'react';
import {CSVLink} from 'react-csv';

const CSVformat = () => {
    const csvData = [
        ["First Name", "Last Name", "Email","CWID"],
        ["Tony", "Stark", "ts@avengers.com","12345678"],
        ["Steve", "Rogers", "rs@avengers.com","45678912"],
        ["Bruce", "Banner", "bb@avengers.com","87654321"]
      ];    
      
      return (
          <CSVLink filename={"sample-file.csv"} className="btn btn-info mt-3" data={csvData} target="_blank">Sample File</CSVLink>
    );
};

export default CSVformat;