/**
 * Inline script que roda antes do React hidratar, garantindo que o atributo
 * data-theme já esteja no <html> e não haja flash do tema errado.
 */
export function ThemeScript() {
  const code = `
    (function () {
      try {
        var stored = localStorage.getItem('esup-theme');
        var theme = stored;
        if (!theme) {
          theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        document.documentElement.setAttribute('data-theme', theme);
      } catch (e) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
