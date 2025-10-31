export const Footer = () => {
  return (
    <footer className="border-t bg-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Sistema de Gestão de Estoque. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
