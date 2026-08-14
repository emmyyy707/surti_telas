import { Modal } from '@/shared/ui/Modal';

interface CustomOrderFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  step: number;
  steps: string[];
  onStepChange: (step: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  saving: boolean;
  isEditing: boolean;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
}

export function CustomOrderFormModal({
  open,
  onClose,
  title,
  step,
  steps,
  onStepChange,
  onBack,
  onSubmit,
  saving,
  isEditing,
  children,
  footerActions,
}: CustomOrderFormModalProps) {
  const isLastStep = step === steps.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Anterior
              </button>
            )}
            {step < steps.length && (
              <button
                type="button"
                onClick={() => onStepChange(step + 1)}
                className="px-4 py-2 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
              >
                Siguiente
              </button>
            )}
            {isLastStep && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Solicitar cotización'}
              </button>
            )}
            {footerActions}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stepper mejorado */}
        <div className="flex items-center justify-between">
          {steps.map((label, idx) => {
            const isActive = step === idx + 1;
            const isCompleted = step > idx + 1;
            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isCompleted
                        ? 'bg-blue-50 text-blue-600 border-blue-600'
                        : 'bg-gray-50 text-gray-500 border-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`text-xs mt-1.5 text-center ${
                    isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded transition-colors ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Contenido del formulario con padding mejorado */}
        <div className="rounded-lg">
          {children}
        </div>
      </div>
    </Modal>
  );
}
