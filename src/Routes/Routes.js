import { Routes, Route } from "react-router-dom";

import PublicLayout from "../Layouts/PublicLayout";
import DashboardLayout from "../Layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

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
import ProntuarioSolipedeEdit from "../Pages/Dashboard/gestaoFVR/pronturarioEdit";
import ConfiguracaoPerfil from "../Pages/Dashboard/usuarios/configPerfil";
import EstatisticasGestaoFVR from "../Pages/Dashboard/gestaoFVR/EstatisticasGestaoFVR";

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
        {/* Rota padrão */}
        <Route index element={<Estatisticas />} />
        <Route path="list" element={<DashboardList />} />
        <Route path="AdminCargaHoraria" element={<AdminCargaHoraria />} />

        {/* Rotas COM autenticação */}
        <Route path="estatisticasfvr" element={<ProtectedRoute><EstatisticasGestaoFVR /></ProtectedRoute>} />
        <Route path="gestaofvr" element={<ProtectedRoute><GestaoFvr /></ProtectedRoute>} />
        <Route path="gestaofvr/taskcreatepage" element={<ProtectedRoute><TaskCreatePage /></ProtectedRoute>} />
        <Route path="gestaofvr/solipede/create" element={<ProtectedRoute><CadastrarSolipede /></ProtectedRoute>} />
        <Route path="gestaofvr/solipede/:numero/prontuario" element={<ProtectedRoute><ProntuarioSolipede /></ProtectedRoute>} />
        <Route path="gestaofvr/solipede/prontuario/edit/:numero" element={<ProtectedRoute><ProntuarioSolipedeEdit /></ProtectedRoute>} />
        <Route path="gestaofvr/solipede/edit/:numero" element={<ProtectedRoute><EditarSolipede /></ProtectedRoute>} />
        <Route path="gestaofvr/configPerfil" element={<ProtectedRoute><ConfiguracaoPerfil /></ProtectedRoute>} />

      </Route>

      {/* Usuários - Sem autenticação */}
      <Route path="dashboard/criarusuario" element={<CriarUsuario />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default MainRoutes;
