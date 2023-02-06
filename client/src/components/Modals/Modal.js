import React from 'react'
import ReactDOM from 'react-dom'

const Modal = (props) => {
    return ReactDOM.createPortal(
        <div className="modal" onClick={props.action === 'Delete' ? props.onDismiss : null}>
            <div onClick={(e) => e.stopPropagation()} className="modal__card">
                <h4>{props.title}</h4>
                {props.children}
                <div className="modal__card__actions">
                    <button 
                        className={`modal-btn__${props.action === 'Delete' ? 'red' : 'green'}`}
                        onClick={props.action === 'Delete' ? props.onDelete : props.onEdit}>
                        {props.action}
                    </button>
                    <button className="modal-btn__gray" onClick={props.onDismiss}>Cancel</button>
                </div>
            </div>
        </div>,
        document.getElementById('modal')
    );
};

export default Modal;