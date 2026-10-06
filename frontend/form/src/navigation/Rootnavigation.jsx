import React from 'react'
import { Routes, Route } from 'react-router-dom'

// import Navbar from '../components/Navbar'
import Register from '../pages/Register'
import Login from '../pages/Login'
import Home from '../pages/Home'
import Profile from '../pages/Profile'

function Rootnavigation() {
    return (
        <>
            {/* <Navbar /> */}

            <Routes>
                <Route path="/" element={<Register/>} />
                

                <Route path="/login" element={<Login/>} />

                
                <Route path="/home" element={<Home/>} />
                <Route path="/profile" element={<Profile/>} />
                    
                

            </Routes>

            


        </>
    )
}

export default Rootnavigation