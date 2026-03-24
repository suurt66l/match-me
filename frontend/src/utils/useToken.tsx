import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function useToken() {
    const [token, setToken] = useState( getToken() );

  /* Getting token from users local storage */
    function getToken() {
      const userToken = localStorage.getItem('token');
      
      if (!userToken) {
        return null;
      }

      try {
        const decoded = jwtDecode(userToken);
        const currentTime = Date.now() / 1000; // Convert to seconds

        //JWT tokens without expiring time are rejected
        //Also if token is expired, remove it and return null
        if (!decoded.exp || decoded.exp < currentTime) {
            localStorage.removeItem('token');
            return null;
        }
        
        return userToken;
      } catch (error) {
        // If decoding fails, token is invalid
        localStorage.removeItem('token');
        
        return null;
      }
    }

    /* Saves token to the users local storage*/
    function saveToken(userToken: string) {
        localStorage.setItem('token', userToken);
        setToken(userToken);
    }

    /* Removes token from the users local storage*/
    function removeToken() {
        localStorage.removeItem('token');
        setToken(null);
    };

    return {
        token,
        setToken: saveToken,
        removeToken
    }
}