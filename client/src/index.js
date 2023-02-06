import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { AuthUserProvider } from './context/AuthUserContext';

ReactDOM.render(
    <AuthUserProvider>
        <App />
    </AuthUserProvider>,
    document.getElementById('root')
);