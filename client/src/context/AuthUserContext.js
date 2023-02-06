import React, { createContext, useState } from 'react';
import { SERVER } from '../constants/routes';

const AuthUserContext = createContext();

const AuthUserProvider = ({children}) => {
    const [authUser, setAuthUser] = useState({});

    const saveAuthUser = (userData) => {
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem('authUser', JSON.stringify(userData));
        localStorage.setItem('expiryDate', JSON.stringify(expiryDate.toISOString()));
        setAuthUser(userData);
        autoSignOut(remainingMilliseconds);
    }

    const getAuthUser = async () => {
        const expiryDate = JSON.parse(localStorage.getItem('expiryDate'));
        if (!expiryDate) {
            return;
        }
        if (new Date(expiryDate) <= new Date()) {
            removeAuthUser();
            return;
        }
        const user = JSON.parse(localStorage.getItem('authUser')) || {};
        const remainingMilliseconds =
        new Date(expiryDate).getTime() - new Date().getTime();
        autoSignOut(remainingMilliseconds);
        if(user._id) {
            const resp = await fetch(SERVER + '/auth/getUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user._id })
            });
            if(resp.status === 200) {
                const data = await resp.json();
                setAuthUser({...data.userObj, token: user.token});
            } 
        } else {
            setAuthUser({})
        }
    }

    const removeAuthUser = async () => {
        // const userId = authUser._id;
        const user = JSON.parse(localStorage.getItem('authUser'));
        // const token = authUser.token;
        localStorage.removeItem('authUser');
        localStorage.removeItem('expiryDate');
        setAuthUser({});
        try {
            await fetch(SERVER + '/auth/removeActiveUser', {
                method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId: user._id })
            });
        } catch(err) {
            console.log(err);
        }
    }
    const autoSignOut = (milliseconds) => {
        setTimeout(() => {
            removeAuthUser();
        }, milliseconds);
    }

    const updateUserPosts = (newPost) => {
        setAuthUser(previousState => {
            const updatedState = previousState;
            const updatedPosts = updatedState.posts;
            updatedPosts.push(newPost);
            updatedState.posts = updatedPosts;
            return updatedState;
        });
    }

    const removeUserPost = (postId) => {
        setAuthUser(previousState => {
            const updatedState = previousState;
            const updatedPosts = updatedState.posts.filter(post => post._id.toString() !== postId.toString());
            updatedState.posts = updatedPosts;
            return updatedState;
        });
    }

    return (
        <AuthUserContext.Provider value={{
            authUser,
            saveAuthUser,
            getAuthUser,
            removeAuthUser,
            updateUserPosts,
            removeUserPost
        }}
        >
            {children}
        </AuthUserContext.Provider>
    )
}

export { AuthUserContext, AuthUserProvider };