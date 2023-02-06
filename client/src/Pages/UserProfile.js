import React, { useContext, useState } from 'react'
import useUser from '../hooks/useUser'
import useUserActivies from '../hooks/useUserActivies';
import { SERVER } from '../constants/routes';
import formatDistance from 'date-fns/formatDistance'
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { AuthUserContext } from '../context/AuthUserContext';
import Modal from '../components/Modals/Modal';

const UserProfile = (props) => {
    const { authUser } = useContext(AuthUserContext);
    const userId = props.match.params.userId;
    const { user } = useUser(userId);
    const { userActivities, setUserActivies } = useUserActivies(userId);
    const [removeModal, setRemoveModal] = useState({
        isOpen: false,
        postId: null
    });
    document.title = 'User Profile';
    if(!user || !userActivities) {
        return <div className="profile-page"></div>
    }


    const handlePostRemoval = async () => {
        if(removeModal.postId && authUser.token) {
            const resp = await fetch(SERVER + '/feed/delete-post', {
                method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + authUser.token
                    },
                    body: JSON.stringify({ postId: removeModal.postId })
            });
            if(resp.status === 204) {
                //Remove post from profile page
                setUserActivies(current => {
                    let updatedActivities = current; 
                    const updatedPosts = updatedActivities.allPostsByUser.filter(post => post._id !== removeModal.postId);
                    updatedActivities.allPostsByUser = updatedPosts;
                    return updatedActivities;
                });
                handleModalDismiss();
            }
        }
    }

    const handleModalDismiss = () => {
        setRemoveModal({
            isOpen: false,
            postId: null
        })
    };

    const postDeleteOnClick = (postId) => {
        setRemoveModal({
            isOpen: true,
            postId: postId
        })
    };

    return (
        <div className="profile-page-container">
            {removeModal.isOpen && <Modal action="Delete" title="Are you sure you want to do this?" onDelete={handlePostRemoval} onDismiss={handleModalDismiss} />}
            <div className="profile-page">
                {/* ProfileCard */}
                <div className="profile-page__card">
                    <img className="profile-page__card__avatar" src={SERVER + '/' + user.avatar} alt="profile-avatar" />
                    <div className="profile-page__card__info">
                        <p className="profile-page__card__username">Username: <span className="text-hl">{user.username}</span></p>
                        <p className="profile-page__card__contact">Email: <span className="text-hl">{user.email}</span></p>
                        <p className="profile-page__card__totalPosts">Total Posts Created: <span className="text-hl">{user.totalPostsCreated}</span></p>
                        <p className="profile-page__card__discussions">Active Discussions: <span className="text-hl">{user.posts.length}</span></p>
                        <p className="profile-page__card__replies">Replies: <span className="text-hl">{userActivities.replies}</span></p>
                        <p className="profile-page__card__joined-date">Joined at: <span className="text-hl">{new Date(user.createdAt).toLocaleDateString()}</span></p>
                    </div>
                </div>
                {/* Posts-Title */}
                <div className="profile-page__posts">
                    <h3>{user.username} Posts:</h3>
                    {userActivities.allPostsByUser.map(post => {
                        const date = formatDistance(
                            new Date(post.createdAt),
                            new Date(),
                        { addSuffix: true }
                        );
                        return (
                            <div key={post._id} className="profile-page__posts__title">
                                <Link to={'/view-post/' + post._id}>
                                    <p>{post.title}</p>
                                </Link>
                                <p>{date}</p>
                                {authUser._id && authUser._id === user._id && <FontAwesomeIcon onClick={() => postDeleteOnClick(post._id)} className="del-icon" icon={faTrash} />}
                            </div>
                        )
                    })}
                </div>
                {/* User Comments */}
                <div className="profile-page__comments">
                    <h3>{user.username} Comments:</h3>
                    {userActivities.userComments.map(comm => (
                        <div key={comm._id} className="user-comment">
                            <div className="user-comment__title">
                                <p>Replied to:</p>
                                <Link to={'/view-post/' + comm.postId}>
                                    <h4>{comm.postTitle}</h4>
                                </Link>
                            </div>
                            <p className="user-comment__reply">{comm.comment}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Sidebar />
        </div>
    )
}

export default UserProfile
