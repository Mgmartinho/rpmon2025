import React from 'react'
import {Routes, Route, BrowserRouter} from "react-router-dom"
import Home from '../Pages/Home'
import SobreNos from '../Pages/SobreNos'

const MainRoutes = () => {
  return (
    
      <Routes>
        <Route element={<Home />} path='/'/>
        <Route element={<SobreNos />} path='sobreNos'/>
      </Routes>
   
    
  )
}

export default MainRoutes