import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DASHBOARD } from '../constants/routes'

const NotFound = () => {

    useEffect(() => {
        document.title = 'Error - Page Not Found'
    }, [])

    return (
        <div className="not-found-page">
            <h1>PAGE NOT FOUND</h1>
            <p>
                Page you are looking for does no longer exist.<br />
                <Link to={DASHBOARD}>Go back to the Dashboard</Link>
            </p>
        </div>
    )
}

export default NotFound
