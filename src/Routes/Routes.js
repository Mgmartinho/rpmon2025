
import { Routes, Route } from "react-router-dom";
import Home from "../Pages/Home";
import NossaHistoria from "../Pages/nossaHistoria";
import EternosComandantes from "../Pages/EternosComandantes";
import ComandantesRpmon from "../Pages/ComandanteRpmon";
import NotFound from "../Pages/404"; // importe sua página 404 corretamente
import {Routes, Route,} from "react-router-dom"
import Home from '../Pages/Home'
import NossaHistoria from '../Pages/nossaHistoria'
import EternosComandantes from "../Pages/EternosComandantes"
import ComandantesRpmon from "../Pages/ComandanteRpmon"
const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="nossaHistoria" element={<NossaHistoria />} />
      <Route path="comandante" element={<ComandantesRpmon />} />
      <Route path="eternosComandantes" element={<EternosComandantes />} />

      {/* Catch-all para rotas que não existem */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainRoutes;
