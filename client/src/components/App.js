import React, { lazy, Suspense, useContext, useEffect } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { DASHBOARD, SIGNUP, SIGNIN, VIEWPOST, PROFILEPAGE } from '../constants/routes';
import { AuthUserContext } from '../context/AuthUserContext';
import { IsUserLoggedIn } from '../helpers/is-user-logged-in';
import './styles/App.scss';
const Dashboard = lazy(() => import ('../Pages/Dashboard'));
const SignUp = lazy(() => import ('../Pages/SignUp'));
const SignIn = lazy(() => import ('../Pages/SignIn'));
const NotFound = lazy(() => import ('../Pages/NotFound'));
const ViewPost = lazy(() => import ('../Pages/ViewPost'));
const UserProfile = lazy(() => import ('../Pages/UserProfile'));

// Maybe change Create Post input to ref instead of usestate to reduce rerenders

const App = () => {
    const { getAuthUser, authUser } = useContext(AuthUserContext);
    
    useEffect(() => {
        getAuthUser();
    }, []);

    return (
        <Suspense fallback={<div className="suspense-bg">HELLO WORLD</div>}>
            <div className="App">
                <Router>
                    <Switch>
                        <Route path={DASHBOARD} exact component={Dashboard}/>
                        <IsUserLoggedIn path={SIGNUP} exact user={authUser} >
                            <SignUp />
                        </IsUserLoggedIn>
                        <IsUserLoggedIn path={SIGNIN} exact user={authUser}>
                            <SignIn />
                        </IsUserLoggedIn>
                        <Route path={VIEWPOST} exact component={ViewPost}/>
                        <Route path={PROFILEPAGE} exact component={UserProfile} />
                        <Route component={NotFound} />
                    </Switch>
                </Router>
            </div>
        </Suspense>
    )
}

export default App
