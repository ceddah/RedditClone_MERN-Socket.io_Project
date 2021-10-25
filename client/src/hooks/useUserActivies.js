import { useState, useEffect } from 'react';
import { SERVER } from '../constants/routes';

const useUserActivies = (userId) => {
    const [userActivities, setUserActivies] = useState(null);

    useEffect(() => {
        let isSubscribed = true
        
        const fetchUserActivities = async () => {
            const resp = await fetch(SERVER + '/auth/getUserActivies', {
                method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId: userId })
            });
            if(resp.status === 200) {
                const data = await resp.json();
                if(isSubscribed) {
                    setUserActivies(data);
                }
            }
        }

        fetchUserActivities();

        return () => {
            isSubscribed = false;
        }

    }, [userId])

    return { userActivities, setUserActivies };
};

export default useUserActivies;