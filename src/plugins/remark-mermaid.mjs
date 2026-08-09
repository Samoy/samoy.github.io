/**
 * remark 插件：把 ```mermaid 代码块转换为 <pre class="mermaid">，
 * 绕过 shiki 高亮，由客户端按需懒加载 mermaid 渲染。
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function walk(node) {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    if (child.type === 'code' && child.lang === 'mermaid') {
      return {
        type: 'html',
        value: `<pre class="mermaid">${escapeHtml(child.value)}</pre>`,
      };
    }
    walk(child);
    return child;
  });
}

export default function remarkMermaid() {
  return (tree) => walk(tree);
}
