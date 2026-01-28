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
import ExclusaoSolipede from "../Pages/Dashboard/gestaoFVR/ExclusaoSolipede";
import Ferradoria from "../Pages/Dashboard/gestaoFVR/Ferradoria";
import Exames from "../Pages/Dashboard/gestaoFVR/exames";

const MainRoutes = () => {
  return (
    <Routes>

      {/* PÚBLICO - Acessível a todos */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="nossaHistoria" element={<NossaHistoria />} />
        <Route path="comandante" element={<ComandantesRpmon />} />
        <Route path="eternosComandantes" element={<EternosComandantes />} />
      </Route>

      {/* DASHBOARD */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Rota padrão - Estatísticas públicas */}
        <Route index element={<Estatisticas />} />
        <Route path="list" element={<DashboardList />} />
        

        {/* Carga Horária - Página Privada (botões internos com controle de permissão) */}
        <Route path="AdminCargaHoraria" element={
            <AdminCargaHoraria /> }
          // <ProtectedRoute requiredPermission="GESTAO_SOLIPEDES">
          // </ProtectedRoute>
         />

        {/* Estatísticas GestãoFVR - Veterinários e acima */}
        <Route path="estatisticasfvr" element={
          <ProtectedRoute requiredPermission="GESTAO_SOLIPEDES">
            <EstatisticasGestaoFVR />
          </ProtectedRoute>
        } />
        
        {/* Ferradoria - Ferrador, Veterinários e acima */}
        <Route path="ferradoria" element={
          <ProtectedRoute requiredPermission="GESTAO_FERRAGEAMENTO">
            <Ferradoria />
          </ProtectedRoute>
        } />
        
        {/* Gestão de Solípedes - Ferrador, Pagador e acima */}
        <Route path="gestaofvr" element={
          <ProtectedRoute requiredPermission="GESTAO_SOLIPEDES">
            <GestaoFvr />
          </ProtectedRoute>
        } />
        
        {/* Tasks/Lançamentos - Veterinários e acima */}
        <Route path="gestaofvr/taskcreatepage" element={
          <ProtectedRoute requiredPermission="VISUALIZAR_TASKS">
            <TaskCreatePage />
          </ProtectedRoute>
        } />
        
        {/* Cadastrar Solípede - Veterinários e acima */}
        <Route path="gestaofvr/solipede/create" element={
          <ProtectedRoute requiredPermission="CRIAR_SOLIPEDE">
            <CadastrarSolipede />
          </ProtectedRoute>
        } />
        
        {/* Prontuário - Veterinários e acima */}
        <Route path="gestaofvr/solipede/:numero/prontuario" element={
          <ProtectedRoute requiredPermission="GESTAO_PRONTUARIO">
            <ProntuarioSolipede />
          </ProtectedRoute>
        } />
        
        <Route path="gestaofvr/solipede/prontuario/edit/:numero" element={
          <ProtectedRoute requiredPermission="GESTAO_PRONTUARIO">
            <ProntuarioSolipedeEdit />
          </ProtectedRoute>
        } />
        
        {/* Editar Solípede - Veterinários e acima */}
        <Route path="gestaofvr/solipede/edit/:numero" element={
          <ProtectedRoute requiredPermission="EDITAR_SOLIPEDE">
            <EditarSolipede />
          </ProtectedRoute>
        } />
        
        {/* Exames - Veterinários e acima */}
        <Route path="gestaofvr/solipede/:numero/exames" element={
          <ProtectedRoute requiredPermission="GESTAO_PRONTUARIO">
            <Exames />
          </ProtectedRoute>
        } />

        {/* Exclusão - Veterinário Admin e Desenvolvedor */}
        <Route path="gestaofvr/exclusao" element={
          <ProtectedRoute requiredPermission="EXCLUIR_SOLIPEDE">
            <ExclusaoSolipede />
          </ProtectedRoute>
        } />
        
        {/* Configuração de Perfil - Todos autenticados */}
        <Route path="gestaofvr/configPerfil" element={
          <ProtectedRoute>
            <ConfiguracaoPerfil />
          </ProtectedRoute>
        } />

      </Route>

      {/* Criar Usuário - Rota pública para auto-cadastro */}
      <Route path="dashboard/criarusuario" element={<CriarUsuario />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default MainRoutes;
