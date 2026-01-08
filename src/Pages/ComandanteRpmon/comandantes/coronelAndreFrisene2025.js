import React from "react";
import "../styles.css";
import CelFrisene from "../../../Imagens/comandante/CelFrisene.jpg";

const AndreFrisene2025 = () => {
  return (
    <div>
      <section class="mt-5 mb-5">
        <div class="container fixed-page">
          <h2 class="text-dark pt-0 pb-5 text-center">
            Comandante do Regimento de Polícia Montada "9 de Julho"
          </h2>
          <div class="row">
            <div class="col-md-5 col-12 mb-4">
              <a href="/comandante" className="text-decoration-none">
                <h3 class="text-dark">Ten. Cel. André Frisene</h3>
                <img
                  src={CelFrisene}
                  alt="Foto do Comandante"
                  class="pt-1 w-100 fixed-image rounded-3"
                />
              </a>
            </div>

            <div class="col-md-7 col-12 mb-4 pt-2 overflow-custom text-justify">
              <h3>Histórico Curricular</h3>

              {/* QUEM É */}
              <h4>Quem é:</h4>
              <p>
                André Frisene, oficial da Polícia
                Militar do Estado de São Paulo com uma trajetória marcada pela
                dedicação, liderança e compromisso institucional. Natural de
                Votuporanga/SP, nascido em 02 de junho de 1975, possui formação
                superior e mais de 30 anos de serviços prestados à corporação.
                Atualmente é o Comandante do Regimento de Polícia Montada “9 de
                Julho”.
              </p>

              {/* INGRESSO E FORMAÇÃO */}
              <h4>Ingresso na Polícia Militar:</h4>
              <ul>
                <li>Admissão: 06/03/1995</li>
                <li>Quadro: QOPM – Quadro de Oficiais da Polícia Militar</li>
                <li>Formação inicial como Aluno-Oficial (Alof PM)</li>
                <li>Promoção a Aspirante a Oficial: 05/12/1998</li>
              </ul>

              {/* PROMOÇÕES */}
              <h4>Promoções na Carreira:</h4>
              <ul>
                <li>06/03/1995 – Aluno-Oficial PM</li>
                <li>05/12/1998 – Aspirante a Oficial</li>
                <li>15/12/1999 – 2º Tenente PM</li>
                <li>24/05/2006 – 1º Tenente PM</li>
                <li>25/08/2013 – Capitão PM</li>
                <li>24/05/2020 – Major PM</li>
                <li>25/08/2024 – Tenente-Coronel PM</li>
              </ul>

              {/* MOVIMENTAÇÕES */}
              <h4>Movimentações na Corporação:</h4>
              <ul>
                <li>
                  RPMon – Diversas transferências e classificações por
                  conveniência do serviço
                </li>
                <li>3º BPChq – Classificação por promoção</li>
                <li>
                  CAES – Adições e desligamentos por conveniência do serviço
                </li>
                <li>CPChq – Classificações e transferências</li>
                <li>APMBB – Adições e desligamentos</li>
                <li>EM/E – Adições e desligamentos</li>
                <li>22º BPM/M – Classificação por declaração</li>
              </ul>

              {/* CURSOS – seu conteúdo original */}
              {/* <h4>Cursos:</h4>
              <ul>
                <li>Curso de força tatica – 24/11/1999</li>
                <li>Tropa Montada – 08/03/2000</li>
                <li>CEP - Curso de Técnicas de Ensino – 08/12/2000</li>
                <li>Curso de Administrador de Bens Imóveis – 11/09/2000</li>
                <li>Bacharel em Educação Física - PMESP – 11/08/2006</li>
                <li>Bacharel em Direito – UNIBAN/SP – 18/06/2008</li>
                <li>
                  Instrutor de Equitação no Exército do Uruguai – 30/11/2012
                </li>
                <li>CAO – Curso de Aperfeiçoamento de Oficiais – 01/08/2016</li>
                <li>
                  Curso Internacional de Multiplicador de Polícia Comunitária –
                  14/08/2017
                </li>
                <li>Curso de Gestão de Contratos – 28/08/2019</li>
                <li>Mestrado em Filosofia – PUC/SP – 10/11/2021</li>
                <li>Bacharel em Filosofia – PUC/SP – Inacabado</li>
                <li>
                  Pós-graduação Lato Sensu em Filosofia do Exercício – EPM –
                  Inacabado
                </li>
                <li>CSP – Curso Superior de Polícia – 03/03/2023</li>
              </ul> */}

              {/* MEDALHAS – seu conteúdo original */}
              {/* <h4>Medalhas:</h4>
              <ul>
                <li>1º Centenário do RPMON – 24/01/2001</li>
                <li>Mérito Comunitário – 30/09/2008</li>
                <li>Valor Militar Grau Bronze – 31/10/2008</li>
                <li>Mérito e Dedicação – D.A. XV – 22/11/2010</li>
                <li>
                  Colar “Cadete PM Ruytemberg Rocha” - 1º Grau – 31/10/2013
                </li>
                <li>Batalhão dos Expedicionários Paulistas – 29/06/2017</li>
                <li>“Batalhão Humaitá” – 09/10/2017</li>
                <li>Valor Militar Grau Prata – 03/07/2017</li>
                <li>Cinquentenário do Canil – 10/11/2022</li>
                <li>Centenário 1º BPChq Tobias Aguiar – 13/03/2023</li>
                <li>Capitão Alberto Mendes Júnior – 05/07/2023</li>
                <li>Solar dos Andradas – 18/06/2024</li>
                <li>Ordem dos Cavaleiros de Rabelo – PMDF – 18/06/2024</li>
                <li>“Comandos e Operações Especiais da PMESP” – 4º BPChq</li>
              </ul> */}

              {/* LAUREAS – seu conteúdo original */}
              <h4>Láureas de Mérito Pessoal:</h4>
              <ul>
                <li>5º Grau – 30/09/1999</li>
                <li>4º Grau – 14/05/2002</li>
                <li>3º Grau – 25/10/2002</li>
                <li>2º Grau – 21/12/2004</li>
                <li>1º Grau – 23/10/2013</li>
              </ul>

              {/* CONSELHO PERMANENTE */}
              {/* <h4>Conselho Permanente de Justiça – Juiz Militar:</h4>
              <p>
                <strong>Períodos:</strong>
              </p>
              <ul>
                <li>05/01/2009 a 31/03/2009 – 1ª Auditoria</li>
                <li>01/10/2014 a 19/12/2014 – 3ª Auditoria</li>
                <li>02/10/2023 a 19/12/2023 – 1ª Auditoria</li>
              </ul> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AndreFrisene2025;
