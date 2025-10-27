/**
 * EmptyState Component - Estado vazio com ilustração
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Ícone (componente Lucide)
 * @param {string} props.title - Título do estado vazio
 * @param {string} props.description - Descrição
 * @param {React.ReactNode} props.action - Ação (geralmente um Button)
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 p-4 bg-gray-100 rounded-full">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6 max-w-md">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
