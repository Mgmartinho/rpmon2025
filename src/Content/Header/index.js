import {React, } from 'react';
import style from "./style.css"
import { Link } from 'react-router-dom';
import MainRoutes from '../../Routes/Routes';

const Header = () => {
  return (
    <div className="container">
      <div className="content">
        <div>
          {/* Logo1 */}
        </div>
        <h1>REGIMENTO DE POLICIA MONTADA "09 DE JULHO"</h1>
        <div>
          {/* Logo2 */}
        </div>
      </div>
      <div className="menu">
        <nav>
          <ul>
            <li><Link to="/"> Home </Link></li>
            <li><Link to="sobreNos"> Sobre Nós </Link></li>
            
          </ul>
        </nav>
      </div>
    </div>
     
  );
};

export default Header;
