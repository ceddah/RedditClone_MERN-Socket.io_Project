import React, { useState, useEffect, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom';
import { SIGNUP, SERVER, DASHBOARD } from '../constants/routes';
import { AuthUserContext } from '../context/AuthUserContext';
import Loader from '../components/Loader';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isBtnDisabled = email === '' || password === '';
    const history = useHistory();
    const { saveAuthUser } = useContext(AuthUserContext);

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await fetch(SERVER + '/auth/sign-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
            })
        })

        if(result.status === 200 || result.status === 201) {
            setEmail('');
            setPassword('')
            setError([]);
            const res = await result.json();
            saveAuthUser(res.userData);
            setTimeout(() => {
                setIsLoading(false);
                history.push(DASHBOARD);
            }, 2000)
        } else {
            const res = await result.json();
            setIsLoading(false);
            setError(res.errors);
            console.log(error);
        }
    }

    useEffect(() => {
        document.title = 'Sign In';

        return () => setIsLoading(false);
    }, []);


    return (
        <div className="AUTH">
            <div className="AUTH__container">
                <h2>Sign in with your Account</h2>
                {isLoading ? (
                    <Loader loaderClass="loader-big" color="#023020" size={70} />
                ) : (
                    <form onSubmit={handleSignIn}>
                        {error.length !== 0 ? error.map((err, idx) => <p key={idx} className="error-message">{err}</p>) : undefined}
                        <div className="AUTH__form-control">
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
                        </div>
                        <button 
                            className={`AUTH__submit ${isBtnDisabled ? 'isDisabled' : ''}`} 
                            disabled={isBtnDisabled}
                        >
                            Sign In
                        </button>
                        <p>Don't have an Account?<br/>
                            <Link className="link-btn" to={SIGNUP}>Register Here</Link>    
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}

export default SignIn
