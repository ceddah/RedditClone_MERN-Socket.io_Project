import React, { useState, useEffect, useContext } from 'react'
import Feed from '../components/Feed';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { SERVER } from '../constants/routes';
import { AuthUserContext } from '../context/AuthUserContext';
import openSocket from 'socket.io-client';

const Dashboard = () => {
    const { authUser, updateUserPosts, removeUserPost } = useContext(AuthUserContext);
    const [posts, setPosts] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        postsCount: null 
    });
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [authError, setAuthError] = useState('');

    const postHandler = async (inputData) => {
        const result = await fetch(SERVER + '/feed/create-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + authUser.token
            },
            body: JSON.stringify({title: inputData.title, content: inputData.content})
        });
        if(result.status === 201) {
            const res = await result.json();
            // setPosts(previousPosts => {
            //     const posts = [...previousPosts];
            //     const post = res.data;
            //     posts.unshift(post);
            //     return posts;
            // });
            updateUserPosts(res.data);
            setAuthError('');
        } else {
            const res = await result.json();
            setAuthError(res.error);
        }
    };

    const postDeleteHandler = async (postId) => {
        const resp = await fetch(SERVER + '/feed/delete-post', {
            method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + authUser.token
                },
                body: JSON.stringify({ postId: postId })
        });
        if(resp.status === 204) {
            // setPosts(previousPosts => {
            //     const posts = previousPosts.filter(post => post._id !== postId);
            //     return posts;
            // });
            removeUserPost(postId);
        }
    }
    
    const changePage = (direction) => {
        if(direction === 'next') {
            return setPagination(current => ({...current, currentPage: current.currentPage + 1}))
        } else if (direction === 'prev') {
            return setPagination(current => ({...current, currentPage: current.currentPage - 1}))
        }
        return null;
    }

    const appendNewPost = (post) => {
        setPosts(previousPosts => ([post, ...previousPosts]));
    }
    // const appendNewPost = (post) => {
    //     setPosts(previousPosts => {
    //         const posts = [...previousPosts];
    //         posts.unshift(post);
    //         return posts;
    //     });
    // }

    const removeDeletedPost = (postId) => {
        setPosts(current => ([...current.filter(post => post._id !== postId)]))
    }

    useEffect(() => {
        let isSubscribed = true
        document.title = 'Dashboard';

        const fetchAllPosts = async () => {
            try {
                const resp = await fetch(SERVER + `/feed/posts?page=${pagination.currentPage}`);
                const result = await resp.json();
                if(isSubscribed) {
                    setPosts(result.data);
                    setPagination(current => ({...current, postsCount: result.postsCount }));
                    setTimeout(() => {
                        setLoadingPosts(false);
                    }, 1500)
                }
            } catch(err) {
                console.log(err);
            }
        }

        fetchAllPosts();

        const socket = openSocket(SERVER, { transports: ["websocket"] });
        socket.on('posts', data => {
            switch (data.action) {
                case 'addNewPost':
                    appendNewPost(data.post);
                    break;
                case 'removePost':
                    removeDeletedPost(data.postId);
                    break;
                default:
                    return null;
            }
        })

        return () => {
            isSubscribed = false;
            setLoadingPosts(false);
        }
    }, [pagination.currentPage])

    return (
        <div className="dashboard">
            <Feed 
                postHandler={postHandler} 
                authError={authError} 
                setAuthError={setAuthError} 
                authUser={authUser}
                changePage={changePage}
                pagination={pagination}
                loadingPosts={loadingPosts}
            >
                {loadingPosts ? (
                    <Loader loaderClass="loader-big" color="#FFDC23" size={70} />
                ) : (
                    posts.map((post, idx) => <Feed.Post postDeleteHandler={postDeleteHandler} postData={post} key={idx} />)
                )}
            </Feed>
            <Sidebar posts={posts} />
        </div>
    )
}

export default Dashboard
