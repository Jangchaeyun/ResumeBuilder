/** 쉼표·顿号 등으로 구분된 기술 스택 문자열을 태그 배열로 변환 */
export function parseCommaList(value?: string | null): string[] {
  return (value ?? '')
    .split(/[,，、|]/)
    .map((s) => s.trim())
    .filter(Boolean)
}
