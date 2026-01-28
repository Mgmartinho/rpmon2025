import { Routes, Route, lazy, Suspense } from "react-router-dom";
import PublicLayout from "../Layouts/PublicLayout";
import DashboardLayout from "../Layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

// ============================================
// 🚀 OTIMIZAÇÃO: LAZY LOADING DE ROTAS
// ============================================

// Componente de loading
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Carregando...</span>
    </div>
    <p className="text-muted">Carregando página...</p>
  </div>
);

// Páginas Públicas - Lazy Loading
const Home = lazy(() => import("../Pages/Home"));
const NossaHistoria = lazy(() => import("../Pages/nossaHistoria"));
const EternosComandantes = lazy(() => import("../Pages/EternosComandantes"));
const ComandantesRpmon = lazy(() => import("../Pages/ComandanteRpmon"));
const NotFound = lazy(() => import("../Pages/404"));

// Dashboard - Geral - Lazy Loading
const DashboardList = lazy(() => import("../Pages/Dashboard/geral/DashboardList"));
const Estatisticas = lazy(() => import("../Pages/Dashboard/geral/Estatisticas"));
const AdminCargaHoraria = lazy(() => import("../Pages/Dashboard/geral/AdminCargaHoraria"));

// Dashboard - Gestão FVR - Lazy Loading
const GestaoFvr = lazy(() => import("../Pages/Dashboard/gestaoFVR/gestaoFvr"));
const TaskCreatePage = lazy(() => import("../Pages/Dashboard/gestaoFVR/tasks"));
const CadastrarSolipede = lazy(() => import("../Pages/Dashboard/gestaoFVR/cadastrarSolipede"));
const EditarSolipede = lazy(() => import("../Pages/Dashboard/gestaoFVR/editarSolipede"));
const ProntuarioSolipede = lazy(() => import("../Pages/Dashboard/gestaoFVR/pronturario"));
const ProntuarioSolipedeEdit = lazy(() => import("../Pages/Dashboard/gestaoFVR/pronturarioEdit"));
const EstatisticasGestaoFVR = lazy(() => import("../Pages/Dashboard/gestaoFVR/EstatisticasGestaoFVR"));
const ExclusaoSolipede = lazy(() => import("../Pages/Dashboard/gestaoFVR/ExclusaoSolipede"));
const Ferradoria = lazy(() => import("../Pages/Dashboard/gestaoFVR/Ferradoria"));
const Exames = lazy(() => import("../Pages/Dashboard/gestaoFVR/exames"));

// Dashboard - Usuários - Lazy Loading
const CriarUsuario = lazy(() => import("../Pages/Dashboard/usuarios/CriarUsuario"));
const ConfiguracaoPerfil = lazy(() => import("../Pages/Dashboard/usuarios/configPerfil"));

const MainRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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
          
          {/* Carga Horária - Página pública (botões internos com controle de permissão) */}
          <Route path="AdminCargaHoraria" 
          element=
          {<AdminCargaHoraria />} />

          {/* GESTÃO FVR - Requer autenticação */}
          <Route 
            path="gestaoFVR" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <GestaoFvr />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="gestaoFVR/estatisticasFVR" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <EstatisticasGestaoFVR />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="gestaoFVR/criar" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <TaskCreatePage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="gestaoFVR/cadastrarSolipede" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <CadastrarSolipede />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="gestaoFVR/editarSolipede/:numero" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <EditarSolipede />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="gestaoFVR/prontuario/:numero" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <ProntuarioSolipede />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="gestaoFVR/prontuario/edit/:numero" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <ProntuarioSolipedeEdit />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="gestaoFVR/exclusao/:numero" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <ExclusaoSolipede />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="gestaoFVR/ferradoria/:numero" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <Ferradoria />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="gestaoFVR/exames/:numero" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <Exames />
              </ProtectedRoute>
            } 
          />

          {/* USUÁRIOS - Requer autenticação */}
          <Route 
            path="usuarios/criar" 
            element={
              <ProtectedRoute requiredLevel="administrador">
                <CriarUsuario />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="usuarios/configuracoes" 
            element={
              <ProtectedRoute requiredLevel="usuario">
                <ConfiguracaoPerfil />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default MainRoutes;
