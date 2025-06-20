export function filtrarURLs({ urls, filter }: { urls: string[]; filter: string }): string[] {
  let termosDeBusca = filter.split(/,\s*/).map((item) => item.toLowerCase());

  return urls.filter((url) => {
    const urlEmMinusculas = url.toLowerCase();
    return termosDeBusca.some((term) => urlEmMinusculas.includes(term));
  });
}
