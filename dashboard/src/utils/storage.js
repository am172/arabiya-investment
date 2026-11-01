import { TOKEN_KEY } from '../constants/config';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    return;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    return;
  }
};