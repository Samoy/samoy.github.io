/**
 * remark 插件：把旧文章中非标准的代码块语言标识映射为 shiki 支持的语言，
 * 例如 ```objective-C -> objc、```react -> jsx。
 */
const LANG_MAP = {
  'objective-c': 'objc',
  react: 'jsx',
};

function walk(node) {
  if (node.type === 'code' && typeof node.lang === 'string') {
    const mapped = LANG_MAP[node.lang.toLowerCase()];
    if (mapped) node.lang = mapped;
  }
  if (node.children) node.children.forEach(walk);
}

export default function remarkCodeLang() {
  return (tree) => walk(tree);
}
