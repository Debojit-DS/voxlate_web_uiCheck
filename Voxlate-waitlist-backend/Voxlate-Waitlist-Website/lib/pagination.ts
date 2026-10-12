export function paginationParams(params: URLSearchParams, defaultSize = 25, maxSize = 100) {
  const positiveInteger = (value: string | null, fallback: number, max: number) => {
    if (!value || !/^\d+$/.test(value.trim())) return fallback;
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < 1) return fallback;
    return Math.min(number, max);
  };
  return { page: positiveInteger(params.get("page"), 1, 1_000_000), pageSize: positiveInteger(params.get("pageSize"), defaultSize, maxSize) };
}
