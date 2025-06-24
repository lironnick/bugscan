export function filtrarURLs({ urls, filter }: { urls: any[]; filter: string }): any[] {
  const termosDeBusca = filter.split(/,\s*/).map((item) => item.toLowerCase());

  return urls.filter((item) => termosDeBusca.some((term) => item.path.toLowerCase().includes(term)));
}
