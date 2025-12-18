export const destacamentos = [
    {
        codigo: "1",
        regiao: "São Paulo",
        destacamento: "APMBB - Academia de Policia Militar do Barro Branco",
        cavalos: "20",
        Equoterapia: "Sim",
        atendimento: "15",
    },
     {
        codigo: "2",
        regiao: "São Paulo",
        destacamento: `RPMon - Regimento de Policia Montada "9 de Julho" `,
        cavalos: "256",
        Equoterapia: "Sim",
        atendimento: "120",
    },
    {
        codigo: "3",
        regiao: "Santos",
        destacamento: `CPI-6`,
        cavalos: "35",
        Equoterapia: "Sim",
        atendimento: "20",
    },
    {
        codigo: "4",
        regiao: "Marilia",
        destacamento: `CPI-2 `,
        cavalos: "15",
        Equoterapia: "Sim",
        atendimento: "15",
    },
    {
        codigo: "5",
        regiao: "Presidente Prudente",
        destacamento: `CPI-3 `,
        cavalos: "30",
        Equoterapia: "Sim",
        atendimento: "30",
    },
    {
        codigo: "6",
        regiao: "Araraquara",
        destacamento: `CPI-4 `,
        cavalos: "22",
        Equoterapia: "Sim",
        atendimento: "17",
    },
    {
        codigo: "7",
        regiao: "São Jose Dos Campos",
        destacamento: `CPI-2 `,
        cavalos: "17",
        Equoterapia: "Sim",
        atendimento: "23",
    },
    
];




//  <section className="d-flex bg-white py-5">
//         <Container>
//           <h2 className="text-center mb-4">Area de atuação</h2>
//           <Row className="g-3">
//             {!ativo || !regiaoSelecionada ? (
//               <Col
//                 xs={12}
//                 md={4}
//                 lg={4}
//                 sm={6}
//                 className="text-center p-4 shadow-sm rounded-2 bg-light"
//               >
//                 <div className="mb-3">
//                   <h5 className="mb-1 fw-bold">Regiões</h5>
//                   <p className="mb-0 fs-5 text-dark">16</p>
//                 </div>
//                 <div className="mb-3">
//                   <h5 className="mb-1 fw-bold">Destacamento</h5>
//                   <p className="mb-0 fs-5 text-dark">13</p>
//                 </div>
//                 <div className="mb-3">
//                   <h5 className="mb-1 fw-bold">Centro de Equoterapia</h5>
//                   <p className="mb-0 fs-5 text-dark">10</p>
//                 </div>
//                 <div className="mb-3">
//                   <h5 className="mb-1 fw-bold">Atendimentos médio diário</h5>
//                   <p className="mb-0 fs-5 text-dark">20 pessoas</p>
//                 </div>
//                 <div className="mb-3">
//                   <h5 className="mb-1 fw-bold">Total de solípedes</h5>
//                   <p className="mb-0 fs-5 text-dark">502</p>
//                 </div>
//               </Col>
//             ) : (
//               <Col
//                 xs={12}
//                 md={4}
//                 lg={4}
//                 sm={6}
//                 className="text-center p-4 shadow-sm rounded-2 bg-light"
//               >
//                 <div className="mb-3">
//                   <h5 className="mb-1 fw-bold">Regiões</h5>
//                   <p className="mb-0 fs-5 text-dark">
//                     {regiaoSelecionada.regiao}
//                   </p>
//                 </div>
//                 <div className="mb-3">
//                   <h5 className="mb-1 fw-bold">Destacamento</h5>
//                   <p className="mb-0 fs-5 text-dark">
//                     {regiaoSelecionada.destacamento}
//                   </p>
//                 </div>
//                 <div className="mb-3">
//                   <h5 className="mb-1 fw-bold">Centro de Equoterapia</h5>
//                   <p className="mb-0 fs-5 text-dark">
//                     {regiaoSelecionada.Equoterapia}
//                   </p>
//                 </div>
//                 <div className="mb-3">
//                   <h5 className="mb-1 fw-bold">Atendimentos médio diário</h5>
//                   <p className="mb-0 fs-5 text-dark">
//                     {regiaoSelecionada.atendimento}
//                   </p>
//                 </div>
//                 <div className="mb-3">
//                   <h5 className="mb-1 fw-bold">Total de solípedes</h5>
//                   <p className="mb-0 fs-5 text-dark">
//                     {regiaoSelecionada.cavalos}
//                   </p>
//                 </div>
//               </Col>
//             )}
//           </Row>
//         </Container>
//       </section>