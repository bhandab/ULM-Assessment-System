import React from 'react';
import {Modal, Button} from 'react-bootstrap'

const deleteModal = (props) => {
    return (
        <Modal show={props.show} centered onHide={props.hide}>
            <Modal.Title style={{color:"red"}} className="ml-3">
                Confirm Delete <hr/>
            </Modal.Title>
            <Modal.Body>
                <h5>Do you want to delete this {props.value}?</h5>
                <h5 style={{textAlign:'center', color:'orange'}}>{props.name}</h5>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn btn-success" onClick={props.delete}>Yes</Button>
                <Button className="btn btn-danger" onClick={props.hide}>No</Button>
            </Modal.Footer>
        </Modal>
    )

};

export default deleteModal;