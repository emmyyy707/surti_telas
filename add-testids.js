const fs = require('fs');
const path = 'C:\\Users\\usuario\\surti_telas\\software_SurtiTelas.Fronend\\src\\presentation\\pages\\admin\\PedidosPersonalizados.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "className={s.quotationEditor}",
  'className={s.quotationEditor} data-testid="quotation-editor"'
);

content = content.replace(
  "className={s.productConceptRow}",
  'className={s.productConceptRow} data-testid="concept-row"'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
