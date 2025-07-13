import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Header2 from './components/Header/header2';
import Header3 from './components/Header/header3';
import Header4 from './components/Header/header4';
import Footer from './components/Footer';
import Home from "./Pages/Home"
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
