import { Routes, Route } from "react-router-dom";

import PublicLayout from "../Layouts/PublicLayout";
import DashboardLayout from "../Layouts/DashboardLayout";

// Públicas
import Home from "../Pages/Home";
import NossaHistoria from "../Pages/nossaHistoria";
import EternosComandantes from "../Pages/EternosComandantes";
import ComandantesRpmon from "../Pages/ComandanteRpmon";
import NotFound from "../Pages/404";

// Dashboard
import DashboardList from "../Pages/Dashboard/geral/DashboardList";
import Estatisticas from "../Pages/Dashboard/geral/Estatisticas";
import AdminCargaHoraria from "../Pages/Dashboard/geral/AdminCargaHoraria";
import GestaoFvr from "../Pages/Dashboard/gestaoFVR/gestaoFvr";
import TaskCreatePage from "../Pages/Dashboard/gestaoFVR/tasks";
import CadastrarSolipede from "../Pages/Dashboard/gestaoFVR/cadastrarSolipede";
import EditarSolipede from "../Pages/Dashboard/gestaoFVR/editarSolipede";
import ProntuarioSolipede from "../Pages/Dashboard/gestaoFVR/pronturario";
import CriarUsuario from "../Pages/Dashboard/usuarios/CriarUsuario";
const MainRoutes = () => {
  return (
    <Routes>

      {/* PÚBLICO */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="nossaHistoria" element={<NossaHistoria />} />
        <Route path="comandante" element={<ComandantesRpmon />} />
        <Route path="eternosComandantes" element={<EternosComandantes />} />
      </Route>

      {/* DASHBOARD */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Estatisticas />} />
        <Route path="list" element={<DashboardList />} />
        <Route path="estatisticas" element={<Estatisticas />} />
        <Route path="AdminCargaHoraria" element={<AdminCargaHoraria />} />
        <Route path="gestaofvr" element={<GestaoFvr />} />
        <Route path="gestaofvr/taskcreatepage" element={<TaskCreatePage />} />
        <Route path="gestaofvr/solipede/create" element={<CadastrarSolipede />} />
        <Route path="gestaofvr/solipede/prontuario" element={<ProntuarioSolipede />} />

        <Route
          path="gestaofvr/solipede/edit/:numero"
          element={<EditarSolipede />}
        />
      </Route>

    {/* Usuarios */}
        <Route path="dashboard/criarusuario" element={<CriarUsuario />} />
        {/* <Route path="dashboard/login" element={<Login />} /> */}


      {/* 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default MainRoutes;
