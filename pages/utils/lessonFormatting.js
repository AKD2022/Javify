// Match explicit backticks and Java API/type tokens, avoiding ordinary English words.
const terms = /(`[^`\n]+`|\b(?:ArrayList(?:<[^>\n]+>)?|String|Integer|Double|Scanner|IOException|File|NullPointerException|ArrayIndexOutOfBoundsException|Math\.(?:abs|sqrt|pow|random)(?:\(\))?|System\.out\.(?:print|println)(?:\(\))?|int|double|boolean|void|static|private|public|final|null|true|false|length\(\)|substring\(\)|indexOf\(\)|equals\(\)|compareTo\(\)))(?![A-Za-z0-9_])/g;
export function splitJavaTerms(text) {
  return String(text).split(terms).map((value, i) => ({ value: value.startsWith('`') && value.endsWith('`') ? value.slice(1, -1) : value, code: i % 2 === 1 })).filter(part => part.value);
}
