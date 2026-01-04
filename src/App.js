import { Container } from "react-bootstrap";
import { useEffect } from "react";
import MainRoutes from "./Routes/Routes";
import { startTokenExpirationCheck } from "./utils/auth";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function App() {
  useEffect(() => {
    // Inicia verificação periódica de expiração do token (a cada 60 segundos)
    const stopCheck = startTokenExpirationCheck(60000);

    // Cleanup: para a verificação quando o componente for desmontado
    return () => {
      stopCheck();
    };
  }, []);

  return (
    <Container fluid className="d-flex flex-column min-vh-100 p-0">
      <MainRoutes />
    </Container>
  );
}

export default App;
