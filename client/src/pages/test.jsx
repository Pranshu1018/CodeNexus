import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function Test() {

  const navigate=useNavigate()
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const res = await axios.get("http://localhost:8000/check-role", {
          withCredentials: true, // Sends cookies with request
        });
  
        // if (res.data.role !== "admin") {
        //   alert("Access denied! Admins only.");
        //   // Redirect unauthorized users
        //   return;
        // }
        console.log(res.data.role)
        setRole(res.data.role);
      } catch (error) {
        console.log(error)
        alert(error.response?.data?.message || "Access denied!");
        navigate("/login"); // Redirect if token is missing/invalid
      }
    };
  
    checkUserRole();
  }, []);


  return (
    <div>
    <h1>Dashboard</h1>
    {role ? <p>Role: {role}</p> : <p>Checking access...</p>}
  </div>
  )
}