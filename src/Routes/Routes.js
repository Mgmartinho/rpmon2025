import {React} from 'react'
import {Routes, Route, BrowserRouter} from "react-router-dom"
import Home from '../Pages/Home'
import SobreNos from '../Pages/SobreNos'
import EternosComandantes from "../Pages/EternosComandantes"
import ComandantesRpmon from "../Pages/ComandantesRpmon"
const MainRoutes = () => {
  return (
    
      <Routes>
        <Route element={<Home />} path='/'/>
        <Route element={<SobreNos />} path='sobreNos'/>
        <Route element={<ComandantesRpmon />} path='comandante'/>
        <Route element={<EternosComandantes />} path='eternosComandantes'/>
      </Routes>
   
    
  )
}

export default MainRoutes