import { Navigate } from "react-router-dom";
import { Alert, Container } from "react-bootstrap";
import { temPermissao } from "../utils/permissions";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  // Verifica se está autenticado
  if (!token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se não requer permissão específica, apenas verifica autenticação
  if (!requiredPermission) {
    return children;
  }

  // Verifica se tem a permissão necessária
  if (!temPermissao(usuario.perfil, requiredPermission)) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>⛔ Acesso Negado</Alert.Heading>
          <p>
            Você não tem permissão para acessar esta página.
          </p>
          <p className="mb-0">
            <strong>Seu perfil:</strong> {usuario.perfil || "Não definido"}
          </p>
          <hr />
          <p className="mb-0">
            Entre em contato com o administrador do sistema para solicitar acesso.
          </p>
        </Alert>
      </Container>
    );
  }

  return children;
};

export default ProtectedRoute;
