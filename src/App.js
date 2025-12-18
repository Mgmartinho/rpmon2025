import { Container } from "react-bootstrap";
import MainRoutes from "./Routes/Routes";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function App() {
  return (
    <Container fluid className="d-flex flex-column min-vh-100 p-0">
      <MainRoutes />
    </Container>
  );
}

export default App;
