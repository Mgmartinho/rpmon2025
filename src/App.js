import logo from './logo.svg';
import './App.css';
import Home from './Pages/Home';
import Header from './Content/Header';
import Footer from './Content/Footer';
import { BrowserRouter } from 'react-router-dom';
import SobreNos from './Pages/SobreNos';

function App() {
  return (
    <div >
        <Header />
          <SobreNos />
        <Footer />
     
    </div>
  );
}

export default App;
