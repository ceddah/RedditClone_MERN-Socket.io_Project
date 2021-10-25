import React, { useEffect, useState } from 'react'
import { SERVER } from '../constants/routes';
import openSocket from 'socket.io-client';

const UserList = () => {
    const [activeUsers, setActiveUsers] = useState([]);

    useEffect(() => {
        const socket = openSocket(SERVER, { transports: ["websocket"] });
        socket.on('activeUsers', data => {
            switch (data.action) {
                case 'addNewUser':
                    appendNewActiveUser(data.newActiveUser);
                    break;
                case 'removeNewUser':
                    removeActiveUser(data.userId);
                    break;
                default:
                    return null;
            }
        })

        let isSubscribed = true
        
        const fetchActiveUsers = async () => {
            const resp = await fetch(SERVER + '/auth/getActiveUsers');
            if(resp.status === 200) {
                const data = await resp.json();
                if(isSubscribed) {
                    setActiveUsers(data.activeUsers);
                }
            } else {
                console.log('Failed to fetch active Users.')
            }
        };

        fetchActiveUsers();

        return () => isSubscribed = false
    }, [])

    const appendNewActiveUser = (newActiveUser) => {
        setActiveUsers(current => ([...current, newActiveUser]));
    }

    const removeActiveUser = (userId) => {
        setActiveUsers(current => ([...current.filter(user => user.userId !== userId)]))
    }

    return (
        <div className="user-list">
            <h4>Currently Online: {activeUsers.length}</h4>
            <ul className="user-list__ul">
                {activeUsers.map((user, idx) => <li key={idx}># {user.username}</li>)}
            </ul>
        </div>
    )
}

export default UserList
