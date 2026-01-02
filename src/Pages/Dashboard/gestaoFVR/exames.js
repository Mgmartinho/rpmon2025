import { useState, useEffect } from "react";
import { Container, Card, Row, Col, Form, Button, Alert, Badge, Accordion } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../../../services/api";

const Exames = () => {
  const { numero } = useParams();
  const navigate = useNavigate();

  const [solipede, setSolipede] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  // Estado para armazenar os exames selecionados
  const [examesSelecionados, setExamesSelecionados] = useState({
    // Hematologia
    hemogramaCompleto: false,
    hemacias: false,
    hemoglobina: false,
    hematocrito: false,
    indices: false, // VCM, HCM, CHCM
    leucograma: false,
    plaquetas: false,

    // Bioquímica - Função hepática
    ast: false,
    alt: false,
    ggt: false,
    fosfataseAlcalina: false,
    bilirrubinaTotal: false,
    bilirrubinaDireta: false,
    bilirrubinaIndireta: false,

    // Bioquímica - Função renal
    ureia: false,
    creatinina: false,

    // Bioquímica - Músculos
    ck: false,
    ldh: false,

    // Bioquímica - Metabolismo e proteínas
    proteinasTotais: false,
    albumina: false,
    globulinas: false,
    relacaoAG: false,

    // Bioquímica - Eletrólitos
    sodio: false,
    potassio: false,
    cloro: false,
    calcio: false,
    fosforo: false,
    magnesio: false,

    // Bioquímica - Outros
    glicose: false,
    colesterol: false,
    triglicerideos: false,
    lactato: false,

    // Sorologia
    aie: false,
    mormo: false,
    leptospirose: false,
    brucelose: false,
    influenzaEquina: false,
    herpesvirusEquino: false,
    raiva: false,
    encefalomieliteEquina: false,
    arteriteViralEquina: false,

    // Parasitologia
    coproparasitologico: false,
    opg: false,
    coprocultura: false,
  });

  const [observacoes, setObservacoes] = useState("");

  // Buscar dados do solípede
  useEffect(() => {
    const fetchSolipede = async () => {
      try {
        const data = await api.obterSolipede(numero);
        if (data.error) throw new Error(data.error);
        setSolipede(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setMensagem({ tipo: "danger", texto: "Erro ao carregar dados do solípede" });
        setLoading(false);
      }
    };

    if (numero) {
      fetchSolipede();
    }
  }, [numero]);

  // Handler para marcar/desmarcar exames
  const handleCheckboxChange = (exame) => {
    setExamesSelecionados((prev) => ({
      ...prev,
      [exame]: !prev[exame],
    }));
  };

  // Handler para marcar todos de uma categoria
  const marcarTodosCategoria = (categoria) => {
    const novosExames = { ...examesSelecionados };
    
    switch (categoria) {
      case "hematologia":
        novosExames.hemogramaCompleto = true;
        novosExames.hemacias = true;
        novosExames.hemoglobina = true;
        novosExames.hematocrito = true;
        novosExames.indices = true;
        novosExames.leucograma = true;
        novosExames.plaquetas = true;
        break;
      case "funcaoHepatica":
        novosExames.ast = true;
        novosExames.alt = true;
        novosExames.ggt = true;
        novosExames.fosfataseAlcalina = true;
        novosExames.bilirrubinaTotal = true;
        novosExames.bilirrubinaDireta = true;
        novosExames.bilirrubinaIndireta = true;
        break;
      case "funcaoRenal":
        novosExames.ureia = true;
        novosExames.creatinina = true;
        break;
      case "musculos":
        novosExames.ck = true;
        novosExames.ldh = true;
        break;
      case "metabolismo":
        novosExames.proteinasTotais = true;
        novosExames.albumina = true;
        novosExames.globulinas = true;
        novosExames.relacaoAG = true;
        break;
      case "eletrolitos":
        novosExames.sodio = true;
        novosExames.potassio = true;
        novosExames.cloro = true;
        novosExames.calcio = true;
        novosExames.fosforo = true;
        novosExames.magnesio = true;
        break;
      case "outrosBioq":
        novosExames.glicose = true;
        novosExames.colesterol = true;
        novosExames.triglicerideos = true;
        novosExames.lactato = true;
        break;
      case "sorologia":
        novosExames.aie = true;
        novosExames.mormo = true;
        novosExames.leptospirose = true;
        novosExames.brucelose = true;
        novosExames.influenzaEquina = true;
        novosExames.herpesvirusEquino = true;
        novosExames.raiva = true;
        novosExames.encefalomieliteEquina = true;
        novosExames.arteriteViralEquina = true;
        break;
      case "parasitologia":
        novosExames.coproparasitologico = true;
        novosExames.opg = true;
        novosExames.coprocultura = true;
        break;
      default:
        break;
    }
    
    setExamesSelecionados(novosExames);
  };

  // Submeter solicitação de exames
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar se pelo menos um exame foi selecionado
    const algumSelecionado = Object.values(examesSelecionados).some((v) => v === true);
    
    if (!algumSelecionado) {
      setMensagem({ tipo: "warning", texto: "Selecione pelo menos um exame" });
      return;
    }

    setEnviando(true);

    try {
      // Preparar lista de exames selecionados formatada
      const examesLista = [];
      
      // Hematologia
      if (examesSelecionados.hemogramaCompleto) examesLista.push("• Hemograma completo");
      if (examesSelecionados.hemacias) examesLista.push("• Hemácias");
      if (examesSelecionados.hemoglobina) examesLista.push("• Hemoglobina");
      if (examesSelecionados.hematocrito) examesLista.push("• Hematócrito");
      if (examesSelecionados.indices) examesLista.push("• VCM, HCM, CHCM");
      if (examesSelecionados.leucograma) examesLista.push("• Leucograma");
      if (examesSelecionados.plaquetas) examesLista.push("• Plaquetas");
      
      // Bioquímica - Função Hepática
      if (examesSelecionados.ast) examesLista.push("• AST (TGO)");
      if (examesSelecionados.alt) examesLista.push("• ALT (TGP)");
      if (examesSelecionados.ggt) examesLista.push("• GGT");
      if (examesSelecionados.fosfataseAlcalina) examesLista.push("• FA (Fosfatase Alcalina)");
      if (examesSelecionados.bilirrubinaTotal) examesLista.push("• Bilirrubina total");
      if (examesSelecionados.bilirrubinaDireta) examesLista.push("• Bilirrubina direta");
      if (examesSelecionados.bilirrubinaIndireta) examesLista.push("• Bilirrubina indireta");
      
      // Bioquímica - Função Renal
      if (examesSelecionados.ureia) examesLista.push("• Ureia");
      if (examesSelecionados.creatinina) examesLista.push("• Creatinina");
      
      // Bioquímica - Músculos
      if (examesSelecionados.ck) examesLista.push("• CK (Creatina Quinase)");
      if (examesSelecionados.ldh) examesLista.push("• LDH");
      
      // Bioquímica - Metabolismo
      if (examesSelecionados.proteinasTotais) examesLista.push("• Proteínas totais");
      if (examesSelecionados.albumina) examesLista.push("• Albumina");
      if (examesSelecionados.globulinas) examesLista.push("• Globulinas");
      if (examesSelecionados.relacaoAG) examesLista.push("• Relação A/G");
      
      // Bioquímica - Eletrólitos
      if (examesSelecionados.sodio) examesLista.push("• Sódio (Na⁺)");
      if (examesSelecionados.potassio) examesLista.push("• Potássio (K⁺)");
      if (examesSelecionados.cloro) examesLista.push("• Cloro (Cl⁻)");
      if (examesSelecionados.calcio) examesLista.push("• Cálcio (Ca²⁺)");
      if (examesSelecionados.fosforo) examesLista.push("• Fósforo (P)");
      if (examesSelecionados.magnesio) examesLista.push("• Magnésio (Mg²⁺)");
      
      // Bioquímica - Outros
      if (examesSelecionados.glicose) examesLista.push("• Glicose");
      if (examesSelecionados.colesterol) examesLista.push("• Colesterol");
      if (examesSelecionados.triglicerideos) examesLista.push("• Triglicerídeos");
      if (examesSelecionados.lactato) examesLista.push("• Lactato");
      
      // Sorologia
      if (examesSelecionados.aie) examesLista.push("• Anemia Infecciosa Equina (AIE – Coggins)");
      if (examesSelecionados.mormo) examesLista.push("• Mormo");
      if (examesSelecionados.leptospirose) examesLista.push("• Leptospirose");
      if (examesSelecionados.brucelose) examesLista.push("• Brucelose");
      if (examesSelecionados.influenzaEquina) examesLista.push("• Influenza Equina");
      if (examesSelecionados.herpesvirusEquino) examesLista.push("• Herpesvírus Equino (EHV-1/EHV-4)");
      if (examesSelecionados.raiva) examesLista.push("• Raiva");
      if (examesSelecionados.encefalomieliteEquina) examesLista.push("• Encefalomielite Equina");
      if (examesSelecionados.arteriteViralEquina) examesLista.push("• Arterite Viral Equina");
      
      // Parasitologia
      if (examesSelecionados.coproparasitologico) examesLista.push("• Exame coproparasitológico");
      if (examesSelecionados.opg) examesLista.push("• OPG (Ovos Por Grama)");
      if (examesSelecionados.coprocultura) examesLista.push("• Coprocultura");

      // Montar texto formatado para o prontuário
      const textoExames = `SOLICITAÇÃO DE EXAMES LABORATORIAIS\n\n` +
        `Exames solicitados:\n${examesLista.join("\n")}\n\n` +
        (observacoes ? `Observações: ${observacoes}\n\n` : "") +
        `Data da solicitação: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`;

      // Salvar no prontuário
      const registroProntuario = {
        numero_solipede: numero,
        tipo: "Exame",
        observacao: textoExames,
        recomendacoes: observacoes || null,
      };

      await api.salvarProntuario(registroProntuario);

      setMensagem({ tipo: "success", texto: "Solicitação de exames registrada no prontuário com sucesso!" });
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate(`/dashboard/gestaofvr/solipede/${numero}/prontuario`);
      }, 2000);

    } catch (error) {
      console.error(error);
      setMensagem({ tipo: "danger", texto: "Erro ao registrar solicitação de exames no prontuário" });
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <p>Carregando dados do solípede...</p>
      </Container>
    );
  }

  if (!solipede) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Solípede não encontrado</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Body>
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="mb-1">🧪 Solicitação de Exames</h4>
              <small className="text-muted">
                Selecione os exames laboratoriais para o solípede
              </small>
            </div>
            <Badge bg="info" className="p-2">
              Nº {solipede.numero} - {solipede.nome}
            </Badge>
          </div>

          <hr />

          {/* Mensagem de feedback */}
          {mensagem.texto && (
            <Alert variant={mensagem.tipo} dismissible onClose={() => setMensagem({ tipo: "", texto: "" })}>
              {mensagem.texto}
            </Alert>
          )}

          {/* FORMULÁRIO */}
          <Form onSubmit={handleSubmit}>
            <Accordion defaultActiveKey="0">
              {/* 1. HEMATOLOGIA */}
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  🧪 1. Hematologia (Sangue)
                  <small className="text-muted ms-2">
                    - Avalia estado geral, inflamações, infecções e anemia
                  </small>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="mb-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => marcarTodosCategoria("hematologia")}
                    >
                      Marcar todos
                    </Button>
                  </div>
                  <Row>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Hemograma completo"
                        checked={examesSelecionados.hemogramaCompleto}
                        onChange={() => handleCheckboxChange("hemogramaCompleto")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Hemácias"
                        checked={examesSelecionados.hemacias}
                        onChange={() => handleCheckboxChange("hemacias")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Hemoglobina"
                        checked={examesSelecionados.hemoglobina}
                        onChange={() => handleCheckboxChange("hemoglobina")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Hematócrito"
                        checked={examesSelecionados.hematocrito}
                        onChange={() => handleCheckboxChange("hematocrito")}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="VCM, HCM, CHCM"
                        checked={examesSelecionados.indices}
                        onChange={() => handleCheckboxChange("indices")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Leucograma (neutrófilos, linfócitos, monócitos, eosinófilos, basófilos)"
                        checked={examesSelecionados.leucograma}
                        onChange={() => handleCheckboxChange("leucograma")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Plaquetas"
                        checked={examesSelecionados.plaquetas}
                        onChange={() => handleCheckboxChange("plaquetas")}
                      />
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>

              {/* 2. BIOQUÍMICA SANGUÍNEA */}
              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  🧬 2. Bioquímica Sanguínea
                  <small className="text-muted ms-2">
                    - Avalia fígado, rins, músculos, metabolismo e eletrólitos
                  </small>
                </Accordion.Header>
                <Accordion.Body>
                  {/* Função Hepática */}
                  <h6 className="text-primary mt-3">Função Hepática</h6>
                  <div className="mb-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => marcarTodosCategoria("funcaoHepatica")}
                    >
                      Marcar todos
                    </Button>
                  </div>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="AST (TGO)"
                        checked={examesSelecionados.ast}
                        onChange={() => handleCheckboxChange("ast")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="ALT (TGP) - menos específica em equinos"
                        checked={examesSelecionados.alt}
                        onChange={() => handleCheckboxChange("alt")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="GGT"
                        checked={examesSelecionados.ggt}
                        onChange={() => handleCheckboxChange("ggt")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="FA (Fosfatase Alcalina)"
                        checked={examesSelecionados.fosfataseAlcalina}
                        onChange={() => handleCheckboxChange("fosfataseAlcalina")}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Bilirrubina total"
                        checked={examesSelecionados.bilirrubinaTotal}
                        onChange={() => handleCheckboxChange("bilirrubinaTotal")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Bilirrubina direta"
                        checked={examesSelecionados.bilirrubinaDireta}
                        onChange={() => handleCheckboxChange("bilirrubinaDireta")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Bilirrubina indireta"
                        checked={examesSelecionados.bilirrubinaIndireta}
                        onChange={() => handleCheckboxChange("bilirrubinaIndireta")}
                      />
                    </Col>
                  </Row>

                  {/* Função Renal */}
                  <h6 className="text-primary mt-3">Função Renal</h6>
                  <div className="mb-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => marcarTodosCategoria("funcaoRenal")}
                    >
                      Marcar todos
                    </Button>
                  </div>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Ureia"
                        checked={examesSelecionados.ureia}
                        onChange={() => handleCheckboxChange("ureia")}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Creatinina"
                        checked={examesSelecionados.creatinina}
                        onChange={() => handleCheckboxChange("creatinina")}
                      />
                    </Col>
                  </Row>

                  {/* Músculos */}
                  <h6 className="text-primary mt-3">Músculos</h6>
                  <div className="mb-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => marcarTodosCategoria("musculos")}
                    >
                      Marcar todos
                    </Button>
                  </div>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="CK (Creatina Quinase)"
                        checked={examesSelecionados.ck}
                        onChange={() => handleCheckboxChange("ck")}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="LDH"
                        checked={examesSelecionados.ldh}
                        onChange={() => handleCheckboxChange("ldh")}
                      />
                    </Col>
                  </Row>

                  {/* Metabolismo e Proteínas */}
                  <h6 className="text-primary mt-3">Metabolismo e Proteínas</h6>
                  <div className="mb-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => marcarTodosCategoria("metabolismo")}
                    >
                      Marcar todos
                    </Button>
                  </div>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Proteínas totais"
                        checked={examesSelecionados.proteinasTotais}
                        onChange={() => handleCheckboxChange("proteinasTotais")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Albumina"
                        checked={examesSelecionados.albumina}
                        onChange={() => handleCheckboxChange("albumina")}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Globulinas"
                        checked={examesSelecionados.globulinas}
                        onChange={() => handleCheckboxChange("globulinas")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Relação A/G"
                        checked={examesSelecionados.relacaoAG}
                        onChange={() => handleCheckboxChange("relacaoAG")}
                      />
                    </Col>
                  </Row>

                  {/* Eletrólitos */}
                  <h6 className="text-primary mt-3">Eletrólitos</h6>
                  <div className="mb-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => marcarTodosCategoria("eletrolitos")}
                    >
                      Marcar todos
                    </Button>
                  </div>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Sódio (Na⁺)"
                        checked={examesSelecionados.sodio}
                        onChange={() => handleCheckboxChange("sodio")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Potássio (K⁺)"
                        checked={examesSelecionados.potassio}
                        onChange={() => handleCheckboxChange("potassio")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Cloro (Cl⁻)"
                        checked={examesSelecionados.cloro}
                        onChange={() => handleCheckboxChange("cloro")}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Cálcio (Ca²⁺)"
                        checked={examesSelecionados.calcio}
                        onChange={() => handleCheckboxChange("calcio")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Fósforo (P)"
                        checked={examesSelecionados.fosforo}
                        onChange={() => handleCheckboxChange("fosforo")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Magnésio (Mg²⁺)"
                        checked={examesSelecionados.magnesio}
                        onChange={() => handleCheckboxChange("magnesio")}
                      />
                    </Col>
                  </Row>

                  {/* Outros */}
                  <h6 className="text-primary mt-3">Outros</h6>
                  <div className="mb-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => marcarTodosCategoria("outrosBioq")}
                    >
                      Marcar todos
                    </Button>
                  </div>
                  <Row>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Glicose"
                        checked={examesSelecionados.glicose}
                        onChange={() => handleCheckboxChange("glicose")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Colesterol"
                        checked={examesSelecionados.colesterol}
                        onChange={() => handleCheckboxChange("colesterol")}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Triglicerídeos"
                        checked={examesSelecionados.triglicerideos}
                        onChange={() => handleCheckboxChange("triglicerideos")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Lactato"
                        checked={examesSelecionados.lactato}
                        onChange={() => handleCheckboxChange("lactato")}
                      />
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>

              {/* 3. SOROLOGIA */}
              <Accordion.Item eventKey="2">
                <Accordion.Header>
                  🦠 3. Sorologia (Doenças Infecciosas)
                  <small className="text-muted ms-2">
                    - Detecta anticorpos ou antígenos
                  </small>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="mb-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => marcarTodosCategoria("sorologia")}
                    >
                      Marcar todos
                    </Button>
                  </div>
                  <Row>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Anemia Infecciosa Equina (AIE – Coggins)"
                        checked={examesSelecionados.aie}
                        onChange={() => handleCheckboxChange("aie")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Mormo"
                        checked={examesSelecionados.mormo}
                        onChange={() => handleCheckboxChange("mormo")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Leptospirose"
                        checked={examesSelecionados.leptospirose}
                        onChange={() => handleCheckboxChange("leptospirose")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Brucelose"
                        checked={examesSelecionados.brucelose}
                        onChange={() => handleCheckboxChange("brucelose")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Influenza Equina"
                        checked={examesSelecionados.influenzaEquina}
                        onChange={() => handleCheckboxChange("influenzaEquina")}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Herpesvírus Equino (EHV-1 / EHV-4)"
                        checked={examesSelecionados.herpesvirusEquino}
                        onChange={() => handleCheckboxChange("herpesvirusEquino")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Raiva"
                        checked={examesSelecionados.raiva}
                        onChange={() => handleCheckboxChange("raiva")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Encefalomielite Equina (Leste, Oeste, Venezuelana)"
                        checked={examesSelecionados.encefalomieliteEquina}
                        onChange={() => handleCheckboxChange("encefalomieliteEquina")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Arterite Viral Equina"
                        checked={examesSelecionados.arteriteViralEquina}
                        onChange={() => handleCheckboxChange("arteriteViralEquina")}
                      />
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>

              {/* 4. PARASITOLOGIA */}
              <Accordion.Item eventKey="3">
                <Accordion.Header>
                  🧫 4. Parasitologia
                  <small className="text-muted ms-2">
                    - Avalia carga parasitária
                  </small>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="mb-2">
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => marcarTodosCategoria("parasitologia")}
                    >
                      Marcar todos
                    </Button>
                  </div>
                  <Row>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Exame coproparasitológico"
                        checked={examesSelecionados.coproparasitologico}
                        onChange={() => handleCheckboxChange("coproparasitologico")}
                      />
                      <Form.Check
                        type="checkbox"
                        label="OPG (Ovos Por Grama de fezes)"
                        checked={examesSelecionados.opg}
                        onChange={() => handleCheckboxChange("opg")}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="checkbox"
                        label="Coprocultura"
                        checked={examesSelecionados.coprocultura}
                        onChange={() => handleCheckboxChange("coprocultura")}
                      />
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            {/* Observações */}
            <Form.Group className="mt-4">
              <Form.Label>Observações</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Inclua informações adicionais relevantes para a solicitação de exames"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </Form.Group>

            {/* AÇÕES */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Link to={`/dashboard/gestaofvr/solipede/${numero}/prontuario`}>
                <Button variant="outline-secondary">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" variant="primary" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Exames;
