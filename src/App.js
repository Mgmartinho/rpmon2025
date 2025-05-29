import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from "./Pages/Home"
import MainRoutes from "./Routes/Routes"

function App() {
  return (
    <Container fluid className="d-flex flex-column min-vh-100 p-0">
      <Header />
      <main className="flex-fill">
       <MainRoutes />
      </main>
      <Footer />
    </Container>
  );
}

export default App;
