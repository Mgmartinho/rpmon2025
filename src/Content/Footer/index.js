import React from 'react';

const Footer = () => {
  return (
    <div>
      <footer className="bg-black pt-5 text-center pb-2">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-4">
              <a href="http://intranet.policiamilitar.sp.gov.br/" target="_blank" rel="noopener noreferrer">
                <img src="img/200anospm.bmp" height="200" width="350" alt="200 anos PM" />
              </a>
            </div>

            <div className="col-md-4">
              <button
                className="btn btn-dark"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasBottom"
                aria-controls="offcanvasBottom"
              >
                Acesso Rápido
              </button>

              <div
                className="offcanvas offcanvas-bottom"
                tabIndex="-1"
                id="offcanvasBottom"
                aria-labelledby="offcanvasBottomLabel"
              >
                <div className="offcanvas-header">
                  <h5 className="offcanvas-title" id="offcanvasBottomLabel">LINKS UTILITÁRIOS...</h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="offcanvas-body small">
                  <span>
                    <a href="http://intranet.policiamilitar.sp.gov.br">Intranet</a>
                  </span><br />
                  <span>
                    <a href="https://www.ciaf.policiamilitar.sp.gov.br/folhadepagamento/autenticacaosegura.aspx">
                      Holerite Eletrônico
                    </a>
                  </span><br />
                  <span>
                    <a href="http://www6.intranet.policiamilitar.sp.gov.br/unidades/3empm/">3 EM/PM</a>
                  </span><br />
                  <span>
                    <a href="http://www6.intranet.policiamilitar.sp.gov.br/unidades/3empm/">3 EM/PM</a>
                  </span>
                </div>
              </div>
              <br />
              <form className="text-center" role="search">
                <div className="justify-content-center form-group">
                  <p align="center">
                    <input
                      id="escala"
                      type="text"
                      className="form-control text-center"
                      placeholder="Digite o ID Delegada ou Dejem"
                    />
                    &nbsp;&nbsp;
                    <a
                      href="#"
                      onClick={() => {
                        const id = document.getElementById('escala').value;
                        window.open(
                          `http://sistemasadmin.intranet.policiamilitar.sp.gov.br/Escala/arrelpreesc.aspx?${id}`
                        );
                      }}
                      className="btn btn-dark btn-lg btn-block"
                    >
                      Pesquisar
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>

          <br />
          <span className="text-white text-center mt-5">Regimento de Polícia Montada "9 de Julho"</span><br />
          <span className="text-white">Rua Dr. Jorge Miranda, 238, Luz - CEP:01106-000 - Telefone: (11) 3315-0003</span><br />
          <span className="text-white">Email: rpmon@policiamilitar.sp.gov.br</span><br />
          <span className="text-white">Todos os direitos reservados</span>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
