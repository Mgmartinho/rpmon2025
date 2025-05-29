import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from "./Pages/Home"

function App() {
  return (
    <Container fluid className="d-flex flex-column min-vh-100 p-0">
      <Header />
      <main className="flex-fill">
        <Home />
      </main>
      <Footer />
    </Container>
  );
}

export default App;
