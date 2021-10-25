import React, { useState, useEffect } from 'react'

const Form = ({ postHandler, authError, setAuthError }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const isBtnDisabled = title === '' || content === '';

    const onSubmitHandler = (e) => {
        e.preventDefault();
        const postData = {
            title: title,
            content: content
        };
        
        if(title.length >= 5 && content.length >= 5) {
            postHandler(postData);
            setTitle('');
            setContent('');
        } else {
            return;
        }
    }

    useEffect(() => {
        let timeout;
        if(authError !== '') {
            timeout = setTimeout(() => {
                setAuthError('');
            }, 5000)
        }
        return () => clearTimeout(timeout)
    }, [authError])

    return (
        <form id="share-form" onSubmit={onSubmitHandler}>
            {authError !== '' ? <p className="error-message">{authError}</p> : ''}
            <div className="form-control">
                <input 
                    type="text" 
                    name="title" 
                    value={title} 
                    autoComplete="off" 
                    placeholder="Title" 
                    onChange={({ target }) => setTitle(target.value)}
                />
                <textarea 
                    name="content" 
                    value={content} 
                    autoComplete="off" 
                    rows="5" 
                    placeholder="Message"
                    onChange={({ target }) => setContent(target.value)}
                />
            </div>
            <button 
                type="submit" 
                className={`submit-btn ${isBtnDisabled ? 'isDisabled' : ''}`} 
                disabled={isBtnDisabled}
            >SHARE</button>
        </form>
    )
}

export default Form
