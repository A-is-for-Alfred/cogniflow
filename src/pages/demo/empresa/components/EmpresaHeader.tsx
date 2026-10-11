interface EmpresaHeaderProps {
  onBack: () => void;
}

export default function EmpresaHeader({ onBack }: EmpresaHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 md:px-10 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-line"></i>
          Demo
        </button>
        <span className="text-gray-200">|</span>
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#A78BFA" }}
          >
            <i className="ri-brain-line text-white text-sm"></i>
          </span>
          <span className="font-bold text-sm text-black">Cogniflow</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}
        >
          <i className="ri-building-2-line mr-1"></i>
          Panel de Empresa
        </span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            DG
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-black">Diana García</p>
            <p className="text-xs text-gray-400">Directora General</p>
          </div>
        </div>
      </div>
    </header>
  );
}