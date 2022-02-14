import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/signup/Signup';
import Login from './pages/login/Login';
import ForgotPassword from './pages/forgotPassword/ForgotPassword';
import ResetPassword from './pages/resetPassword/ResetPassword';
import Home from './pages/home/Home';
import Profile from './pages/profile/Profile';
import EditProfile from './pages/editProfile/EditProfile';
import Messages from './pages/messages/Messages';


const App = ()=>{
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/forgotpassword' element={<ForgotPassword/>} />
        <Route path='/resetpassword/:token' element={<ResetPassword/>} />
        <Route path='/profile/:profileUserId' element={<Profile/>} />
        <Route path='/profile/:profileUserId/edit' element={<EditProfile/>} />
        <Route path='/messages' element={<Messages/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;