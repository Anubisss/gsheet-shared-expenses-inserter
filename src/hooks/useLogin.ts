import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

const STORAGE_KEY = 'googleAccessToken';

const useLogin = () => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return sessionStorage.getItem(STORAGE_KEY);
  });

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      sessionStorage.setItem(STORAGE_KEY, tokenResponse.access_token);
      setAccessToken(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  });

  const clearAccessToken = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAccessToken(null);
  };

  return { accessToken, login, clearAccessToken };
};

export default useLogin;
