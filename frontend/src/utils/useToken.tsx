import { useState } from 'react';

export default function useToken() {
    
    function getToken() {
      const userToken = localStorage.getItem('token');
    
      //LOGS
      console.log("Got token: " + userToken)
      
      if (!userToken) {
        return null;
      }
      return userToken;
    }

    const [token, setToken] = useState( getToken() );

    function saveToken(userToken: string) {
        localStorage.setItem('token', userToken);
        setToken(userToken);
    }

    return {
        setToken: saveToken,
        token
    }
}