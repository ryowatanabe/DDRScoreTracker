/**
 * Custom Jest transformer for Vue 3 Single File Components (SFCs).
 *
 * Extracts the <script> and <template> sections from a .vue file,
 * injects the template as a JSON-stringified string property (to avoid
 * any template literal escaping issues), and compiles the script with
 * Babel (using @babel/preset-env targeting current node version).
 *
 * The template extraction uses the Vue SFC structure invariant:
 *   <template>...</template>  <script>...</script>  <style>...</style>
 *
 * The outer template's closing </template> is always the last </template>
 * occurrence before the <script> section. This avoids needing to parse HTML
 * properly (e.g., handling > inside attribute values like v-if="count > 0").
 *
 * This approach works with Jest 30 without requiring @vue/vue3-jest.
 */

const babelCore = require('@babel/core');

/**
 * Extract the outer <template>...</template> block's inner content from a Vue SFC.
 *
 * Uses the Vue SFC invariant: the outer template's closing </template> is always
 * the last </template> occurrence before the <script> section begins.
 */
function extractOuterTemplateContent(source) {
  // Find the start of the <script> block to know where the template section ends
  const scriptIndex = source.search(/<script(\s[^>]*)?\s*>/);
  const endBoundary = scriptIndex !== -1 ? scriptIndex : source.length;

  // The last </template> before <script> is the outer SFC template's closing tag
  const beforeScript = source.substring(0, endBoundary);
  const lastCloseIndex = beforeScript.lastIndexOf('</template>');
  if (lastCloseIndex === -1) return null;

  // Find the first <template ...> opening tag
  const openTagMatch = source.match(/<template(\s[^>]*)?\s*>/);
  if (!openTagMatch) return null;

  const openTagEnd = openTagMatch.index + openTagMatch[0].length;
  return source.substring(openTagEnd, lastCloseIndex);
}

/**
 * Extract the <script>...</script> section's inner content.
 * Assumes there is only one <script> block in a Vue SFC.
 */
function extractScriptContent(source) {
  const match = source.match(/<script(?:\s[^>]*)?\s*>([\s\S]*?)<\/script>/i);
  return match ? match[1] : null;
}

module.exports = {
  process(sourceText, sourcePath) {
    const scriptContent = extractScriptContent(sourceText);
    const templateContent = extractOuterTemplateContent(sourceText);

    if (!scriptContent) {
      return { code: 'module.exports = { template: "<div></div>" }' };
    }

    const template = (templateContent || '<div></div>').trim();

    // Use JSON.stringify to produce a safe string literal.
    // This avoids any template literal backtick/interpolation escaping issues.
    const templateJsonStr = JSON.stringify(template);

    // Inject the template property into the default export object.
    // Use a function replacement to prevent $ in the template from being
    // interpreted as special replacement patterns by String.prototype.replace().
    const templateInjection = `export default {\n  template: ${templateJsonStr},`;
    const transformed = scriptContent.replace(/export\s+default\s+\{/, () => templateInjection);

    // Transform ES modules to CommonJS with Babel
    const result = babelCore.transformSync(transformed, {
      filename: sourcePath.replace(/\.vue$/, '.js'),
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    });

    return { code: result.code };
  },
};
