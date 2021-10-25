import React, { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DASHBOARD, SIGNIN, SERVER } from '../constants/routes';
import { AuthUserContext } from '../context/AuthUserContext';
import UserList from './UserList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const Sidebar = ({ posts }) => {
    const [postCount, setPostCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const { authUser, removeAuthUser } = useContext(AuthUserContext);

    useEffect(() => {
        (async() => {
            const resp = await fetch(SERVER + '/feed/count');
            if(resp.status === 200) {
                const data = await resp.json();
                setPostCount(data.postCount);
            } else {
                console.log('Failed to fetch post count.')
            }
        })();
    }, [posts])

    return (
        <div className={`sidebar ${menuOpen ? 'menuActive' : ''}`}>
            {menuOpen && <button onClick={() => setMenuOpen(open => !open)} className="close-menu-btn">
                <FontAwesomeIcon icon={faArrowRight} />
            </button>}
            {!menuOpen && <button onClick={() => setMenuOpen(open => !open)} className="open-menu-btn">
                <FontAwesomeIcon icon={faArrowLeft} />
            </button>}
            <div className="nav-menu">
                <Link to={DASHBOARD}>
                    <button className="nav-menu__btn">Home</button>
                </Link>
                {!authUser.email ? (
                    <Link to={SIGNIN}>
                        <button className="nav-menu__btn">Sign In</button>
                    </Link>
                ): (
                    <button onClick={removeAuthUser} className="nav-menu__btn">Sign Out</button>
                )}
            </div>

            <UserList />

            <h3 className="num-of-messages">Today number of posts that was made is: {postCount}</h3>
        </div>
    )
}

export default Sidebar
