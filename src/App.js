import { Container } from 'react-bootstrap';
import Header2 from './components/Header/header2';
import Footer from './components/Footer';
import MainRoutes from "./Routes/Routes"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <Container fluid className="d-flex flex-column min-vh-100 p-0">
      <Header2 />
      <main className="flex-fill">
       <MainRoutes />
      </main>
      <Footer />
    </Container>
  );
}

export default App;
