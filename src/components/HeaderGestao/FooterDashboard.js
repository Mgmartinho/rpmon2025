import { Container } from "react-bootstrap";

const FooterDashboard = () => {
  return (
    <footer className="bg-dark border-top border-secondary">
      <Container
        fluid
        className="
          d-flex
          justify-content-between
          align-items-center
          px-4
          py-2
          text-light
          opacity-75
          small
        "
      >
        {/* ESQUERDA */}
        <span>© {new Date().getFullYear()} RPMON</span>

        {/* DIREITA */}
        <span>Sistema de Gestão Veterinária</span>
      </Container>
    </footer>
  );
};

export default FooterDashboard;
