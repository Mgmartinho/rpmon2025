import {React} from 'react'
import {Routes, Route, BrowserRouter} from "react-router-dom"
import Home from '../Pages/Home'
import NossaHistoria from '../Pages/nossaHistoria'
import EternosComandantes from "../Pages/EternosComandantes"
import ComandantesRpmon from "../Pages/ComandanteRpmon"
const MainRoutes = () => {
  return (
    
      <Routes>
        <Route element={<Home />} path='/'/>
        <Route element={<NossaHistoria />} path='nossaHistoria'/>
        <Route element={<ComandantesRpmon />} path='comandante'/>
        <Route element={<EternosComandantes />} path='eternosComandantes'/>
      </Routes>
   
    
  )
}

export default MainRoutes