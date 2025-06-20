export function filtrarURLs(urls, search) {
  // Se termosDeBusca for string, transforma em array separando por vírgulas ou espaços
  if (typeof search === 'string') {
    search = search.split(/[\s,]+/).filter(Boolean);
  }

  // Converte os termos de busca para minúsculas para uma comparação case-insensitive
  const termosEmMinusculas = search.map((term) => term.toLowerCase());

  return urls.filter((url) => {
    // Converte a URL para minúsculas para a comparação
    const urlEmMinusculas = url.toLowerCase();
    // Verifica se a URL inclui qualquer um dos termos de busca
    return termosEmMinusculas.some((term) => urlEmMinusculas.includes(term));
  });
}
