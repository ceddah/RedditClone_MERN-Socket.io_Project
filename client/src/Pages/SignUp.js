import React, { useState, useEffect, useRef } from 'react'
import { Link, useHistory } from 'react-router-dom';
import { SIGNIN, SERVER } from '../constants/routes';
import Loader from '../components/Loader';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const imageFileRef = useRef(null);
    const isBtnDisabled = 
        email === '' || 
        password === '' || 
        confirmPassword === '' ||
        username === ''
    ;
    const history = useHistory();

    const handleSignUp = async (e) => {
        e.preventDefault();
        const image = imageFileRef.current.files[0];
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirmPassword', confirmPassword);
        if(image) {
            formData.append('image', image);
        }
        setIsLoading(true);
        const result = await fetch(SERVER + '/auth/sign-up', {
            method: 'POST',
            // headers: {
            //     'Content-Type': 'application/json'
            // },
            body: formData
            // body: JSON.stringify({
            //     username: username,
            //     email: email,
            //     password: password,
            //     confirmPassword: confirmPassword
            // })
        });
        if(result.status === 200 || result.status === 201) {
            setError([]);
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setIsLoading(false);
                history.push(SIGNIN);
            }, 2000)
        } else {
            const res = await result.json();
            setIsLoading(false);
            setError(res.errors);
        }
    }

    useEffect(() => {
        document.title = 'Sign Up';
    }, []);

    return (
        <div className="AUTH">
            <div className="AUTH__container">
                <h2>Sign in with your Account</h2>
                {isLoading ? (
                    <Loader loaderClass="loader-big" color="#023020" size={70} />
                ) : (
                    <form onSubmit={handleSignUp}>
                        {error.length !== 0 ? error.map((err, idx) => <p key={idx} className="error-message">{err}</p>) : undefined}
                        <div className="AUTH__form-control">
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="Username"
                                autoComplete="off"
                                value={username}
                                onChange={({ target }) => setUsername(target.value)}
                            />
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="E-Mail Address"
                                autoComplete="off"
                                value={email}
                                onChange={({ target }) => setEmail(target.value)}
                            />
                            <input 
                                type="password" 
                                name="password" 
                                placeholder="Password" 
                                autoComplete="off"
                                value={password}
                                onChange={({ target }) => setPassword(target.value)}
                            />
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                placeholder="Confirm Password" 
                                autoComplete="off"
                                value={confirmPassword}
                                onChange={({ target }) => setConfirmPassword(target.value)}
                            />
                            <label htmlFor="imageFile">(Optional) Choose Avatar:</label>
                            <input 
                                type="file"
                                name="imageFile"
                                id="imageFile"
                                ref={imageFileRef}
                            />
                        </div>
                        <button 
                            className={`AUTH__submit ${isBtnDisabled ? 'isDisabled' : ''}`} 
                            disabled={isBtnDisabled}
                        >
                            Sign Up
                        </button>
                        <p>Already have an Account?<br/>
                            <Link className="link-btn" to={SIGNIN}>Sign In</Link>    
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}

export default SignUp
