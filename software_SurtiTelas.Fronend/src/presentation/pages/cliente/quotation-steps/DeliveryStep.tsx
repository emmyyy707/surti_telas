import { type UseFormRegister } from 'react-hook-form';
import { type FormValues } from '../MisPedidosPersonalizados';

export interface DeliveryStepProps {
  register: UseFormRegister<FormValues>;
  styles: Record<string, string>;
  selectedFiles: File[];
  _setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  fileUrls: string[];
  _setFileUrls: React.Dispatch<React.SetStateAction<string[]>>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
}

export const DeliveryStep = ({
  register,
  styles,
  selectedFiles,
  _setSelectedFiles,
  fileUrls,
  _setFileUrls,
  handleFileChange,
  removeFile,
}: DeliveryStepProps) => {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.summarySection}>
        <label htmlFor="ref-files" className={styles.label}>Archivos de referencia (JPG, PNG, PDF)</label>
        <input id="ref-files" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple className={styles.hiddenInput} onChange={handleFileChange} />
        <label htmlFor="ref-files" className={styles.uploadLabel}>Seleccionar archivos</label>
        {selectedFiles.length > 0 && (
          <div className={styles.filePreview}>
            {selectedFiles.map((file, idx) => (
              <div key={idx} className={styles.fileChip}>
                {file.type.startsWith('image/') && fileUrls[idx] ? (
                  <img src={fileUrls[idx]} alt={file.name} className={styles.fileChipImage} />
                ) : (
                  <span className={styles.fileChipName}>{file.name}</span>
                )}
                <button type="button" className={styles.removeFileBtn} onClick={() => removeFile(idx)}>Eliminar</button>
              </div>
            ))}
          </div>
        )}
        <span className={styles.hintText}>Puedes adjuntar múltiples archivos.</span>
      </div>

      <div className={styles.summarySection}>
        <label htmlFor="fecha-entrega" className={styles.label}>Fecha solicitada de entrega</label>
        <input id="fecha-entrega" type="date" className={styles.input} {...register('fechaEntregaDeseada')} />
      </div>

      <div className={styles.summarySection}>
        <label htmlFor="uso-pedido" className={styles.label}>Uso del pedido</label>
        <select id="uso-pedido" className={styles.select} {...register('usoFinal')}>
          <option value="">Selecciona</option>
          <option value="USO_PERSONAL">Uso personal</option>
          <option value="EMPRESA">Empresa</option>
          <option value="UNIFORME">Uniforme</option>
          <option value="EVENTO">Evento</option>
          <option value="REGALO">Regalo</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>

      <div className={styles.summarySection}>
        <label htmlFor="notas-cliente" className={styles.label}>Observaciones</label>
        <textarea id="notas-cliente" className={styles.textarea} placeholder="Notas adicionales..." {...register('notasCliente')} />
      </div>
    </div>
  );
};
