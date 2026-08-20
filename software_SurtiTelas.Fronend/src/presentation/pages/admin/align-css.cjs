const fs = require('fs');
const filePath = 'PedidosPersonalizados.module.css';
let content = fs.readFileSync(filePath, 'utf8');

// Add page class at the beginning
content = `.page {
  padding-bottom: 24px;
}

${content}`;

// Remove duplicate metricCard definitions (keep the client version which appears later)
// Find and remove the first metricCard block (lines 29-45 in current file)
const firstMetricCardMatch = content.match(/\.metricCard \{[^}]+\}/);
if (firstMetricCardMatch) {
  content = content.replace(firstMetricCardMatch[0], '');
}

// Remove duplicate metricValue and metricLabel (keep client versions)
content = content.replace(/\.metricValue \{[^}]+\}/, '');
content = content.replace(/\.metricLabel \{[^}]+\}/, '');

// Fix header: remove border-bottom to match client
content = content.replace(
  /\.header \{[^}]+\}/,
  `.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}`
);

// Fix pageTitle and pageSubtitle to match client
content = content.replace(
  /\.pageTitle \{[^}]+\}/,
  `.pageTitle {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px 0;
  letter-spacing: -0.01em;
}`
);

content = content.replace(
  /\.pageSubtitle \{[^}]+\}/,
  `.pageSubtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin: 0;
  font-weight: 500;
}`
);

// Fix tableWrapper to match client (remove box-shadow, keep border-radius: md)
content = content.replace(
  /\.tableWrapper \{[^}]+\}/,
  `.tableWrapper {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}`
);

// Add metricIcon, metricBody classes if missing
if (!content.includes('.metricIcon {')) {
  content = content.replace(
    '.metricCard {',
    `.metricIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.metricBody {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  overflow: hidden;
}

.metricCard {`
  );
}

// Add metric card color variants if missing
if (!content.includes('.metricCardPrimary {')) {
  content = content.replace(
    '.metricCard:hover {',
    `.metricCardPrimary {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(59, 130, 246, 0.02) 100%);
  border-color: rgba(59, 130, 246, 0.25);
}

.metricCardSuccess {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.06) 0%, rgba(34, 197, 94, 0.02) 100%);
  border-color: rgba(34, 197, 94, 0.25);
}

.metricCardWarning {
  background: linear-gradient(135deg, rgba(244, 162, 97, 0.08) 0%, rgba(244, 162, 97, 0.02) 100%);
  border-color: rgba(244, 162, 97, 0.35);
}

.metricIconPending {
  background: rgba(59, 130, 246, 0.12);
  color: var(--color-accent);
}

.metricIconReceived {
  background: rgba(34, 197, 94, 0.12);
  color: var(--color-success);
}

.metricIconWarning {
  background: rgba(244, 162, 97, 0.12);
  color: #f97316;
}

.metricIconDone {
  background: rgba(34, 197, 94, 0.12);
  color: var(--color-success);
}

.metricCard:hover {`
  );
}

// Clean up empty lines
content = content.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(filePath, content.trim() + '\n');
console.log('CSS aligned with client design');
