import { Route, Redirect } from 'react-router-dom';
import React from 'react';
import { DASHBOARD } from '../constants/routes';

export const IsUserLoggedIn = ({user, children, ...rest}) => {
    return (
        <Route 
            {...rest}
            render={() => {
                if(!user._id) {
                    return children;
                }

                if(user._id) {
                    return (
                        <Redirect to={{ pathname: DASHBOARD }} />
                    )
                }
                return null;
            }}
        />
    )
}