import React, { useEffect, useState, useContext, useRef } from 'react'
import { SERVER } from '../constants/routes';
import Sidebar from '../components/Sidebar'
import { Link } from 'react-router-dom';
import Modal from '../components/Modals/Modal';
import formatDistance from 'date-fns/formatDistance'
import { AuthUserContext } from '../context/AuthUserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots, faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import openSocket from 'socket.io-client';

const SinglePost = (props) => {
    const postId = props.match.params.postId;
    const [post, setPost] = useState(undefined);
    const [commInput, setCommInput] = useState('');
    const [modalOpen, setModalOpen] = useState({
        removeModal: {
            isOpen: false,
            commentId: null
        },
        editModal: {
            isOpen: false,
            commentId: null,
            commentContent: null
        }
    })
    const [toggleComments, setToggleComments] = useState(true);
    const [optionsContextMenu, setOptionsContextMenu] = useState(undefined);
    const editInputRef = useRef(null);
    const { authUser } = useContext(AuthUserContext);
    const isDisabled = commInput.length < 10;

    const renderPost = () => {
        if(!post) {
            return (
                <div className="viewPost"></div>
            )
        } else {
            const date = formatDistance(
                new Date(post.createdAt),
                new Date(),
               { addSuffix: true }
            )
            return (
                <div className="post">
                    <div className="post-header">
                        <h2 className="post-title">
                            <span className="title-hl">/r/{post.title}</span>
                        </h2>
                        <p className="post-authorName">
                            - Posted by <Link to={'/users/p/' + post.author.authorId} className="isLink">{post.author.authorName}</Link>
                        </p>
                        <p className="post-date">{date}</p>
                    </div>
                    <div className="post-content-body">
                        <p className="post-content">{post.content}</p>
                    </div>
                    <div className="post-com-length">
                        <button onClick={handleToggleComments}>
                            <FontAwesomeIcon className="com-icon" icon={faCommentDots} />
                        </button>
                        <span>{post.comments.length}</span> Comments
                    </div>
                </div>
            )
        }
    }

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        const postId = post._id;
        const authorId = authUser._id;
        const authorName = authUser.username;
        const comment = commInput;

        const resp = await fetch(SERVER + '/feed/create-comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + authUser.token
            },
            body: JSON.stringify({ postId: postId, authorId: authorId, authorName: authorName, comment: comment })
        });

        if(resp.status === 201) {
            // const data = await resp.json();
            // setPost(data.updatedPost);
            setCommInput('');
        }
    }

    const toggleSubmenuContext = (index) => {
        if(index === optionsContextMenu) {
            return setOptionsContextMenu(undefined);
        }
        setOptionsContextMenu(index);
    }

    const renderComments = () => {
        if(!post) {
            return null;
        } else {
            const updatedByDate = post.comments.sort((lastComment, nextComment) => {
                const date1 = new Date(lastComment.createdAt).getTime()
                const date2 = new Date(nextComment.createdAt).getTime()
                return date1 > date2 ? -1 : 1;
            });
            return updatedByDate.map((comment, index) => {
                const isCommentEdited = new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime();
                const date = formatDistance(
                    new Date(comment.updatedAt),
                    new Date(),
                   { addSuffix: true }
                )
                return (
                    <div key={index} className="comment-card">
                        <h4 className="comment-card__title">{comment.commAuthorName} - {date}</h4>
                        <p className="comment-card__body">{comment.comment}</p>
                        {isCommentEdited && <p className="editedFlag" >Edited</p>}
                        <button 
                            onClick={(e) => toggleSubmenuContext(index)} 
                            className="toggleContextMenu"
                        >
                            <FontAwesomeIcon className="com-icon" icon={faEllipsisV} />
                        </button>
                        {optionsContextMenu === index ? (
                            <div className="comment-card__context-menu">
                                <Link to={'/users/p/' + comment.commAuthorId}>
                                    <button onClick={() => setOptionsContextMenu(undefined)}>Visit Profile</button>
                                </Link>
                                { authUser._id && comment.commAuthorId === authUser._id ? <button onClick={() => openEditModal({comment: comment.comment, commentId: comment._id})}>Edit</button> : null}
                                {
                                    (authUser._id && post.author.authorId === authUser._id) || 
                                    (authUser._id && comment.commAuthorId === authUser._id) ? 
                                    <button onClick={() => openRemoveModal(comment._id)}>Delete</button> : null
                                }
                                <button onClick={() => setOptionsContextMenu(undefined)}>Cancel</button>
                            </div>
                        ) : null}
                    </div>
                )
            })
        }
    }

    const handleToggleComments = () => {
        if(post.comments && post.comments.length > 0) {
            setToggleComments(current => !current);
            setOptionsContextMenu(undefined);
        } else {
            return null;
        }
    }

    const handleModalDismiss = () => {
        setModalOpen({
            removeModal: {
                isOpen: false,
                commentId: null
            },
            editModal: {
                isOpen: false,
                commentId: null,
                commentContent: null
            }
        });
    }

    const openRemoveModal = (commentId) => {
        setOptionsContextMenu(undefined);
        setModalOpen(current => ({...current, removeModal: { isOpen: true, commentId: commentId }}));
    }

    const openEditModal = (commentData) => {
        setOptionsContextMenu(undefined);
        setModalOpen(current => ({...current, editModal: { 
            isOpen: true, 
            commentContent: commentData.comment, 
            commentId: commentData.commentId 
        }}));
    }

    const handleCommentRemoval = async () => {
        const commentId = modalOpen.removeModal.commentId;
        if(commentId !== null && post._id !== undefined) {
            const resp = await fetch(SERVER + '/feed/delete-comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + authUser.token
                },
                body: JSON.stringify({ commentId: commentId, postId: post._id })  
            });

            if(resp.status === 200) {
                // setPost(currentPost => {
                //     let updatedPost = currentPost;
                //     const updatedComments = updatedPost.comments.filter(comm => comm._id !== commentId)
                //     updatedPost.comments = updatedComments;
                //     return updatedPost;
                // })
                handleModalDismiss();
            } else {
                console.log('Failed to delete comment');
            }
        }
    }

    const handleCommentEdit = async () => {
        const commentContent = editInputRef.current.value;
        const commentId = modalOpen.editModal.commentId;
        if(commentContent !== '' && commentContent.length > 5 && post._id !== undefined) {
            const resp = await fetch(SERVER + '/feed/edit-comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + authUser.token
                },
                body: JSON.stringify({ commentContent: commentContent, commentId:commentId, postId: post._id })  
            });

            if(resp.status === 200) {
                // setPost(currentPost => {
                //     let updatedPost = currentPost;
                //     const updatedComments = updatedPost.comments.map(comm => {
                //         if(comm._id === commentId) {
                //             const date = new Date().toISOString();
                //             comm.comment = commentContent;
                //             comm.updatedAt = date;
                //             return comm;
                //         }
                //         return comm;
                //     })
                //     updatedPost.comments = updatedComments;
                //     return updatedPost;
                // })
                handleModalDismiss();
            } else {
                console.log('Failed to edit comment');
            }
        }
    }
    
    const manageComments = (updatedPost) => {
        setPost(updatedPost);
    }

    useEffect(() => {
        document.title = 'View Post';

        const socket = openSocket(SERVER, { transports: ["websocket"] });
        socket.on('comments', data => {
            switch (data.action) {
                case 'addNewComment':
                    manageComments(data.post);
                    break;
                case 'removeComment':
                    manageComments(data.post);
                    break;
                case 'editComment':
                    manageComments(data.post);
                    break;
                default:
                    return null;
            }
        })

        const fetchSinglePost = async () => {
            const resp = await fetch(SERVER + '/feed/getPostById', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postId: postId })
            })

            if(resp.status === 200) {
                const data = await resp.json();
                setPost(data.post);
            } else {
                console.log('Failed to fetch a post by Id.')
            }
        }
        
        fetchSinglePost();

    }, [postId])

    return (
        <div className="viewPost">
            {modalOpen.removeModal.isOpen && <Modal action="Delete" title="Are you sure you want to do this?" onDelete={handleCommentRemoval} onDismiss={handleModalDismiss} />}
            {modalOpen.editModal.isOpen &&
                <Modal 
                    action="Edit" 
                    title="Edit your comment:" 
                    onEdit={handleCommentEdit}
                    onDismiss={handleModalDismiss}
                >
                    <form onSubmit={(e) => e.preventDefault()} className="edit-modal__form">
                        <textarea 
                            className="edit-modal__textarea"
                            name="content" 
                            ref={editInputRef}
                            autoComplete="off" 
                            rows="5"
                            defaultValue={modalOpen.editModal.commentContent}
                        />
                    </form>
                </Modal>
            }
            <div className="viewPost__section">
                {/* POST */}
                {renderPost()}
                {/* Comment Form Inputs */}
                {authUser.username && (
                    <form className="comment-form" onSubmit={handleCommentSubmit}>
                        <p className="comment-title">Comment as {authUser.username}</p>
                        <textarea value={commInput} onChange={({target}) => setCommInput(target.value)} placeholder="What are your thoughts?"></textarea>
                        <button 
                            disabled={isDisabled} 
                            className={`comment-btn ${isDisabled ? 'isDisabled' : ''}`} 
                            type='submit'
                        >Comment</button>
                    </form>
                )}
                {/* Comments */}
                <div className="comments-section">
                    <h3>Comments:</h3>
                    <div className="comments-container">
                        {toggleComments ? renderComments() : <h2 className="toggle-warning">You have disabled comments for this Post.</h2>}
                    </div>
                </div>
            </div>
            <Sidebar />
        </div>
    )
}

export default SinglePost
