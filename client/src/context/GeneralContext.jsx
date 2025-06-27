import React, { createContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const GeneralContext = createContext();

const GeneralContextProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usertype, setUsertype] = useState('');
  const [ticketBookingDate, setTicketBookingDate] = useState();

  const navigate = useNavigate();

  // ✅ Your deployed backend URL
  const BASE_URL = 'https://flight-finder-r7fx.onrender.com';

  const login = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/login`,
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      const data = res.data;
      console.log('Login successful:', data);

      localStorage.setItem('userId', data._id);
      localStorage.setItem('userType', data.usertype);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);

      if (data.usertype === 'customer') {
        navigate('/');
      } else if (data.usertype === 'admin') {
        navigate('/admin');
      } else if (data.usertype === 'flight-operator') {
        navigate('/flight-admin');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      alert('Login failed!');
    }
  };

  const register = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/register`,
        { username, email, usertype, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );

      const data = res.data;
      console.log('Registration successful:', data);

      localStorage.setItem('userId', data._id);
      localStorage.setItem('userType', data.usertype);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);

      if (data.usertype === 'customer') {
        navigate('/');
      } else if (data.usertype === 'admin') {
        navigate('/admin');
      } else if (data.usertype === 'flight-operator') {
        navigate('/flight-admin');
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      alert('Registration failed!');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <GeneralContext.Provider
      value={{
        login,
        register,
        logout,
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        usertype,
        setUsertype,
        ticketBookingDate,
        setTicketBookingDate
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export default GeneralContextProvider;
