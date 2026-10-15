/**
 * Shared inline style helpers that respond to CSS dark mode variables.
 * Use these instead of hardcoded hex colors in page components.
 */

export const cardStyle = {
  background: 'var(--c-surface)',
  border: '1px solid var(--c-border)',
  borderRadius: 14,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

export const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid var(--c-border)',
  fontSize: 13,
  color: 'var(--c-text-main)',
  outline: 'none',
  background: 'var(--c-bg)',
  boxSizing: 'border-box',
};

export const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--c-text-muted)',
  display: 'block',
  marginBottom: 6,
};

export const headingStyle = {
  fontSize: 24,
  fontWeight: 800,
  color: 'var(--c-text-main)',
  margin: 0,
};

export const subTextStyle = {
  fontSize: 13,
  color: 'var(--c-text-muted)',
  margin: 0,
};

export const tableHeadRowStyle = {
  background: 'var(--c-bg)',
  borderBottom: '1px solid var(--c-border)',
};

export const tableHeadCellStyle = {
  textAlign: 'left',
  padding: '14px 20px',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--c-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export const tableBodyRowStyle = {
  borderBottom: '1px solid var(--c-border)',
};

export const tableBodyCellStyle = {
  padding: '14px 20px',
  fontSize: 13,
  color: 'var(--c-text-main)',
};

export const statCardStyle = {
  background: 'var(--c-surface)',
  borderRadius: 14,
  padding: '20px 22px',
  border: '1px solid var(--c-border)',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};
