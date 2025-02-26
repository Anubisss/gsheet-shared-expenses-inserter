import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

const LOCAL_STORAGE_KEY = 'googleAccessToken';

const useLogin = () => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return sessionStorage.getItem(LOCAL_STORAGE_KEY);
  });

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      sessionStorage.setItem(LOCAL_STORAGE_KEY, tokenResponse.access_token);
      setAccessToken(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const clearAccessToken = () => {
    sessionStorage.removeItem(LOCAL_STORAGE_KEY);
    setAccessToken(null);
  };

  return { accessToken, login, clearAccessToken };
};

export default useLogin;
