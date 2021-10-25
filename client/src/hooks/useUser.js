import { useEffect, useState } from "react";
import { SERVER } from "../constants/routes";

const useUser = (userId) => {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        let isSubscribed = true
        
        const getUserById = async () => {
            if(userId) {
                const resp = await fetch(SERVER + '/auth/getUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId: userId })
                });
                if(resp.status === 200) {
                    const data = await resp.json();
                    if(isSubscribed) {
                        setUser(data.userObj);
                    }
                } 
            } else {
                setUser(null);
            }
        }

        getUserById();

        return () => {
            isSubscribed = false;
        }
    }, [userId])

    return { user };
}

export default useUser;