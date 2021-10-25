import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom';
import Form from './Form';
import { SERVER } from '../constants/routes';
import formatDistance from 'date-fns/formatDistance'
import { AuthUserContext } from '../context/AuthUserContext';
import Loader from '../components/Loader';

const Feed = ({ children, postHandler, authError, setAuthError, authUser, changePage, pagination, loadingPosts }) => {
    const lastPage = Math.ceil(pagination.postsCount / 5);
    const isPrevDisabled = pagination.currentPage <= 1;
    const isNextDisabled = pagination.currentPage >= lastPage;

    return (
        <div className="dashboard__feed">
            {authUser.username ? (
                <div className="greet">
                    <p className="greet__msg">Greetings, {authUser.username}</p>
                    <Link to={'/users/p/' + authUser._id}>
                        <img className="greet__img" src={SERVER + '/' + authUser.avatar} alt="avatar" />
                    </Link>
                </div>
            ) : <p className="greet__msg-alt">Please Sign-In to Post.</p>}
            <Form postHandler={postHandler} authError={authError} setAuthError={setAuthError} />
            {children}
            {pagination.postsCount > 5 && !loadingPosts && <div className="pagination">
                <button disabled={isPrevDisabled} onClick={() => changePage('prev')} className="prev-page">Previous</button>
                <button disabled={isNextDisabled} onClick={() => changePage('next')} className="next-page">Next</button>
            </div>}
        </div>
    )
}

Feed.Post = function FeedPost({ postData, postDeleteHandler }) {
    const [loading, setLoading] = useState(false);
    const { authUser } = useContext(AuthUserContext);
    const date = formatDistance(
        new Date(postData.createdAt),
        new Date(),
       { addSuffix: true }
    )

    const content = postData.content.length > 100 ? (
        `${postData.content.slice(0, 100)} ...`
    ) : postData.content;
    
    const deleteHandler = (postId) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            postDeleteHandler(postId);
        }, 1500)
    }

    return (
        <div className="post">
            <div className="post-header">
                <h2 className="post-title">
                    <span className="title-hl">{postData.title}</span>
                </h2>
                <p className="post-authorName">
                - Posted by <Link to={'/users/p/' + postData.author.authorId} className="isLink">{postData.author.authorName}</Link>
                </p>
                <p className="post-date">{date}</p>
            </div>
            <div className="post-content-body">
                <Link to={`/view-post/${postData._id}`}>
                    <p className="post-content">{content}</p>
                </Link>
            </div>
            <div className="post-control-btns">
                <Link to={`/view-post/${postData._id}`} className="reply-btn">View Post</Link>
                {postData.author.authorId && 
                authUser._id === postData.author.authorId && 
                <button onClick={() => deleteHandler(postData._id)} className="remove-btn">{loading ? <Loader loaderClass='loader-small' color="#36454F" size={10} /> : 'Delete'}</button>
                }
            </div>
        </div>
    )
}

export default Feed
