import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const NossaHistoria = () => {
  const [showCollapse, setShowCollapse] = useState(false);

  const toggleCollapse = () => {
    setShowCollapse(!showCollapse);
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12">
          <h2 className="text-center mb-5">"Os 130 de 31"</h2>
        </div>

        <div className="col-md-12 mb-4 text-center">
          <a href="img/historia2.jpg" target="_blank" rel="noopener noreferrer">
            <img
              src="img/historia2.jpg"
              className="img-fluid rounded-3"
              alt="quartel rpmon"
            />
          </a>
        </div>

        <div className="col-md-12">
          <p>
            TRAÇADO HISTÓRICO DO REGIMENTO DE CAVALARIA “ 9 DE JULHO”: Em 1831,
            logo após a abdicação de D. Pedro I em favor de seu filho D.Pedro
            II, de apenas 5 anos, iniciou-se o período denominado Regencial.
            <br />
            <br />
            <button className="btn btn-dark" onClick={toggleCollapse}>
              {showCollapse ? "Fechar" : 'Continuação..."130 de 31"'}
            </button>
          </p>

          {showCollapse && (
            <div className="card card-body">
              <p style={{ textAlign: "justify" }} className="pt-1">
                TRAÇADO HISTÓRICO DO REGIMENTO DE CAVALARIA “ 9 DE JULHO”: Em
                1831, logo após a abdicação de D. Pedro I em favor de seu filho
                D.Pedro II, de apenas 5 anos, iniciou-se o período denominado
                Regencial. As reações e conspirações surgiam por todo Império,
                evidenciando a incapacidade das tropas existentes em
                restabelecer e manter a ordem pública. O então Ministro da
                Justiça, Padre Diogo Antônio Feijó, preocupado com a situação,
                encaminhou à Assembleia Geral o projeto de lei que criava a
                Guarda Municipal Permanente na cidade do Rio de Janeiro, capital
                do Império, permitindo também sua criação nas demais províncias.
                A lei foi aprovada em 10 de outubro e regulamentada, através de
                Decreto Regencial, 12 dias depois. Em 15 de dezembro de 1831, o
                Conselho do Governo da Província de São Paulo, sob a presidência
                do Brigadeiro Raphael Tobias de Aguiar, aprovou a criação do
                Corpo de Guardas Municipais Voluntários a pé e a cavalo. O
                Brigadeiro propôs, então, a criação de uma Companhia de
                Infantaria, com um efetivo de cem praças e oficiais e uma Seção
                de Cavalaria, com 30 praças comandados por um tenente. Dessa
                forma, estavam criados os núcleos de Infantaria e Cavalaria que
                deram origem à atual Polícia Militar - " os 130 de 31" - como
                diz sua canção, sendo que a Seção de Cavalaria foi o embrião do
                atual Regimento de Cavalaria "9 de Julho". Ainda em 1831, em 29
                de dezembro, um Decreto Regencial estabeleceu os uniformes dos
                Oficiais e Praças: "O uniforme da tropa de cavalaria do Corpo de
                Guardas Municipais será composto de: fardeta azul com uma
                pequena aba, botões amarelos e, sobre os ombros, uma corrente de
                metal também amarela; boné de pano azul com fundo preto com o
                Tope Nacional em frente e circulado com duas correntes amarelas.
                O correame será preto em que estará segura a canana, da qual
                penderá a espada. Calça branca no verão e azul no inverno, com
                botins por baixo". Quanto à sua organização, a Seção de
                Cavalaria sofreu um processo curioso, pois apesar do Conselho
                ter deliberado que o núcleo de 30 cavalarianos fosse comandado
                por um tenente, seu primeiro comandante foi o Capitão Pedro
                Alves de Siqueira, designado por Tobias de Aguiar para comandar
                a "Cia. de Cavalaria", fato que já pressupunha a sua relevância
                e posterior evolução. As primeiras instalações da Seção de
                Cavalaria foram numa das alas térreas do Convento Nossa Senhora
                do Carmo, próximo à várzea do Glicério, onde hoje ficama Avenida
                Rangel Pestana e a Rua do Carmo. Consta que tais instalações
                eram precárias e úmidas, influindo no próprio estado disciplinar
                da tropa. Por ser um local improvi-sado, os cavalos ficavam fora
                da sede, a cerca de dois quarteirões de distância. A função
                primeira da Seção de Cavalaria era fazer a ronda noturna na
                cidade de São Paulo tendo inclusive de apagar as luzes da
                cidade, logo ao amanhecer. Em 1833, no entanto, recebeu a missão
                de acompanhar as caravanas que iam para o interior, com o
                objetivo único de prestar-lhes segurança e inibir as ações de
                banditismo. As patrulhas a cavalo rondavam de pistola e espada
                e, dois anos após a sua criação, a Seção já abrigava 57 homens e
                18 animais devidamente resenhados e pertencentes ao patrimônio
                da província. Nessa época, não havia um padrão de pelagem para
                os cavalos, cuja altura não ultrapassava 1,50m, sendo que todos
                portavam, na coxa direita, a marca a ferro de patrimônio - "N",
                de nação, se pertencentes à pro-víncia, e "R", se pertencentes à
                coroa. Em 1842, já no segundo reinado, rompeu-se a "Revolução
                Liberal" em Sorocaba, sob a liderança de Feijó e Tobias,
                respectivamente mentor e criador do Corpo Municipal Permanente
                da Província de São Paulo. Ironicamente, o Capitão Pedro Alves
                de Siqueira, 1ª comandante da Cia. de Cavala-ria, nomeado por
                Tobias e já reformado, foi convidado pelo presidente da
                província, Dr. José da Costa Carvalho, a integrar as tropas
                legalistas sob o comando de Caxias. Apesar da superioridade dos
                revoltosos, a tropa legalista conseguiu neutralizá-los e a
                importância do Capitão Siqueira e seus comandados, dentre eles,
                integrantes da Cia. de Cavalaria, tornou-se indiscutível. Venda
                Grande foi o batismo de fogo dos cavalarianos e a definição das
                características que delinearam seu traçado histórico: abnegação
                e heroísmo na defesa da ordem e da lei. De 1865-70, parte da
                tropa da cavalaria, integrada a todo o Corpo de Permanentes,
                participou da guerra do Paraguai e da heroica "Retirada de
                Laguna". Por outro lado, o período que se sucedeu
                caracterizou-se pela indefinição e descontinuidade formal da
                cavalaria, isto é, ora Com-panhia, ora Seção, ora Destacamento
                anexo à outra Companhia, até que em 28 de janeiro de 1891 foi
                definida novamente como Seção de Cavalaria, passando ainda no
                mesmo ano, no dia 14 de novembro, à condição de Companhia de
                Cavalaria, com o efetivo de 155 homens sob o comando de um
                capitão. O último comandante da Companhia de Cavalaria foi o Cap
                Vicente Lucidoro de Oli-veira, que assumiu em 3 de fevereiro de
                1892. No dia 11 de outubro de 1892, pelas Leis 97A e 97B, a
                tropa montada passou à condição de Corpo de Cavalaria, com um
                tenente-coronel em seu comando. O Corpo de Cavalaria passou a
                contar com dois Esquadrões e um efetivo de 252 homens. Também
                nessa época, sairia definitivamente das instalações do Convento
                do Carmo para o recém-construído Aquartelamento da Luz, descrito
                em item próprio mais à frente. Em 1896, pela Lei 491, de 29 de
                dezembro, o Corpo de Cavalaria passou à condição de Regimento,
                com um efetivo de 350 homens, assim permanecendo até 1901,
                quando retornou novamente à condição de Corpo de Cavalaria. Em
                13 de dezembro de 1918, pela Lei 619-A foi novamente
                reorganizado como Regimento de Cavalaria, assim permanecendo até
                os dias de hoje. O Regimento participou dos movimentos
                revolucionários de 1922, 24, 26, 30 e 32, recebendo,
                posteriormente, em 1955, 0 nome Regimento "9 de Julho", que
                assim permaneceu até 1968, quando se lhe adicionou Cavalaria ao
                nome. Porfim, Regimento de Cavalaria "9 de Julho" não significou
                apenas uma homenagem à Revolução Constitucionalista de 1932,
                evidenciou também que, desde sua origem, nos "130 de 31",
                estabeleceu-se a indissolubilidade de uma história em comum com
                São Paulo e sua Polícia, cuja memória ultrapassa toda e qualquer
                mudança, pois dela persiste a essência que é a sua missão - a
                conquista e guarda do tempo, assegurando a ordem e a legalidade.
                {/* Texto completo aqui */}
              </p>
              <button className="btn btn-dark mt-3" onClick={toggleCollapse}>
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
      <hr />

      <div className="row justify-content-center">
        <div className="col-md-12">
          <h2>O Quartel da Luz</h2>
          <p style={{ textAlign: "justify", columnCount: 3 }}>
            Com o passar dos anos, as instalações do Convento do Carmo, que
            haviam acomodado a Polícia Militar, desde sua criação, em 1831, já
            não apresentavam boas condições. Dessa forma, em 1886, o governo
            adquiriu um terreno, do Convento da Luz, para as novas instalações,
            ficando tanto o projeto como a sua execução a cargo do engenheiro
            Francisco de Paula Ramos de Azevedo. O Quartel da Luz é um vasto
            edifício de forma quadrangular, situado na Av. Tiradentes, Bairro da
            Luz, ladeado pelas Ruas João Theodoro e Jorge Miranda, tendo como
            fundos a Rua Guilherme Maw. Edificação soberba, de linhas severas e
            feição acentuadamente militar, teve sua arquitetura inspirada nas
            fortalezas medievais da Europa, sempre coroadas por ameias, torreões
            e guaritas de espreita. O conjunto arquitetônico é composto por
            quatro pavilhões voltados para um pátio interno e dispostos
            simetricamente, sendo que dois pavilhões possuem um corpo central
            ladeado por duas torres. Sua construção iniciou-se em 1888.
            Executada em alvenaria de tijolos de barro, estrutura de madeira e
            revestimento de telhas de barro, do tipo francês, recebeu
            externamente um tratamento em relevo de estuque escalonado,
            ressaltando suas janelas emolduradas em pinho-de-riga, também
            empregado nas portas do corpo central. Em 1891, ao ser ocupado, o
            Quartel da Luz servia de sede para o 1º e 2º Batalhões de
            Infantaria. Quanto ao Corpo de Cavalaria, sua administração e
            alojamentos ficaram sediados no lado esquerdo do edifício, onde
            permaneceram até 1912, ano em que terminou a construção de sua nova
            sede, nos fundos do referido quartel, onde havia um grande pátio,
            oriundo do aterro que havia precedido as obras. A nova sede tinha
            sua frente voltada para o pátio e era dominada por vasto alpendre.
            Atualmente, apenas o 1º Batalhão de Polícia de Choque "Tobias de
            Aguiar" e o Regimento de Cavalaria "9 de Julho" seguem ocupando as
            instalações do Quartel da Luz. Quanto ao Convento do Carmo, suas
            alas laterais foram demolidas, restando apenas a Igreja, que tem
            atualmente à sua direita o imponente prédio da Secretaria da Fazenda
            do Estado. O Quartel da Luz foi tombado pela Secretaria da Cultura,
            Esportes e Turismo do Estado, através de Resolução datada de 15 de
            dezembro de 1972, nos termos do Decreto-Lei nº 149, de 15 de agosto
            de 1969, pelo então Secretário Dr. Pedro Magalhães Padilha, estando
            tal Resolução escrita no Livro do Tombo, do Conselho de Defesa do
            Patrimônio Histórico, Arqueológico, Artístico e Turístico do Estado
            - Condephaat -, também protegido pela Prefeitura Municipal de São
            Paulo, através da Z8-200-009. Não se pode mencionar o Quartel da Luz
            sem também citar a Chaminé da Luz ou Torre da Luz.
          </p>

          <button className="btn btn-dark mb-3 " onClick={toggleCollapse}>
            {showCollapse ? "Fechar" : '"Quartel da Luz"'}
          </button>

          {showCollapse && (
            <div className="card card-body">
              <div className="text-center">
                <a
                  href="img/quartelLuz2024.JPG"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="img/quartelLuz2024.JPG"
                    className="img-fluid rounded-3 h-50"
                    alt="História 4"
                  />
                </a>
              </div>
              <button className="btn btn-dark mt-3" onClick={toggleCollapse}>
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
      <hr />
    </div>
  );
};

export default NossaHistoria;
