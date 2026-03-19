import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function useToken() {
    
    function getToken() {
      const userToken = localStorage.getItem('token');
    
      //LOGS
      console.log("Got token: " + userToken)
      
      //If token wasn't provided
      if (!userToken) {
        return null;
      }
      
      try {
        const decoded = jwtDecode(userToken);
        const currentTime = Date.now() / 1000; // Convert to seconds

        //If token is expired, remove it and return null
        //Also JWT tokens without expiring time are rejected
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

    const [token, setToken] = useState( getToken() );

    function saveToken(userToken: string) {
        localStorage.setItem('token', userToken);
        setToken(userToken);
    }

    function removeToken() {
        localStorage.removeItem('token');
        setToken(null);
    };

    return {
        setToken: saveToken,
        token,
        removeToken
    }
}