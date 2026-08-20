export function getIdmsErrorMessage(responseOk: boolean, status: number, data: any): string {
  const result = typeof data?.Result === 'string' ? data.Result.trim() : '';
  if (result && result !== 'OK') return result.replace(/^Error\s*:\s*/i, '');

  const backendError = typeof data?.error === 'string' ? data.error.trim() : '';
  if (backendError) return backendError;

  if (!responseOk) return `IDMS proxy request failed (HTTP ${status})`;
  return 'IDMS returned an unexpected response';
}
