export function extractUrl(input: string) {
  const urlMatch = input.match(/^"([^"]+)"/);
  console.log('[urlMatch]: ', urlMatch);

  return urlMatch ? urlMatch[1] : null;
}

export function extractHeader(input: string) {
  const headersMatch = input.match(/headers:\s*(\{[^}]*(?:\{[^}]*\}[^}]*)*\})/);
  console.log('[headersMatch]: ', headersMatch);

  return headersMatch ? headersMatch[1] : null;
}

export function extractJson(input: any, type: string = 'json') {
  //   const startMatch = type === 'json' ? input.match(/json:\s*(\{)/) : input.match(/headers:\s*(\{)/);
  let startMatch;

  if (type === 'json') {
    startMatch = input.match(/json:\s*(\{)/);
  } else if (type === 'credentials') {
    startMatch = input.match(/credentials:\s*(\{)/);
  } else if (type === 'headers') {
    startMatch = input.match(/headers:\s*(\{)/);
  }

  if (!startMatch) return null;

  const startIndex = startMatch.index + startMatch[0].length - 1;
  let braceCount = 0;
  let inTemplate = false;
  let endIndex = startIndex;

  for (let i = startIndex; i < input.length; i++) {
    const char = input[i];

    if (char === '`') {
      inTemplate = !inTemplate;
    } else if (!inTemplate) {
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;

      if (braceCount === 0) {
        endIndex = i;
        break;
      }
    }
  }

  return [input.substring(startMatch.index, endIndex + 1), input.substring(startIndex, endIndex + 1)];
}
