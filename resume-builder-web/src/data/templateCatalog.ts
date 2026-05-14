/** 백엔드 템플릿 코드(01, 02, …)에 대응하는 사용자용 설명 */
export type TemplateCatalogEntry = {
  code: string
  title: string
  tagline: string
  /** 짧은 특징 2~3개 */
  highlights: string[]
  /** 이력서 편집기 `template.theme`에 넣을 값 */
  themeHint: string
  /** 선택 시 `colorPlette`에 넣을 기본 색상 (hex) */
  defaultPalette: string[]
}

const DEFAULT_ENTRY = (code: string): TemplateCatalogEntry => ({
  code,
  title: `디자인 ${code}`,
  tagline: '이력서에 적용할 수 있는 레이아웃 스타일입니다.',
  highlights: ['백엔드에서 제공하는 템플릿 코드입니다.', '이력서 편집기의 템플릿 섹션에서 적용할 수 있어요.'],
  themeHint: code,
  defaultPalette: ['#64748b', '#0f172a', '#e2e8f0'],
})

export const TEMPLATE_CATALOG: Record<string, TemplateCatalogEntry> = {
  '01': {
    code: '01',
    title: '클린 스탠다드',
    tagline: '가장 무난한 단정한 레이아웃. 모든 구독에서 바로 쓸 수 있어요.',
    highlights: ['섹션 구분이 또렷해 가독성이 좋아요.', '첫 이력서 작성에 추천합니다.', '베이직 플랜에 포함됩니다.'],
    themeHint: '01',
    defaultPalette: ['#2dd4bf', '#0f172a', '#94a3b8'],
  },
  '02': {
    code: '02',
    title: '모던 컴팩트',
    tagline: '정보 밀도를 높여 한 페이지에 더 담고 싶을 때.',
    highlights: ['경력·스킬이 많을 때 레이아웃이 유리해요.', '프리미엄에서 사용할 수 있어요.'],
    themeHint: '02',
    defaultPalette: ['#a78bfa', '#1e1b4b', '#cbd5e1'],
  },
  '03': {
    code: '03',
    title: '포트폴리오 강조',
    tagline: '프로젝트와 성과를 앞세운 구성.',
    highlights: ['프로젝트·링크 노출에 초점을 둔 스타일이에요.', '프리미엄에서 사용할 수 있어요.'],
    themeHint: '03',
    defaultPalette: ['#fbbf24', '#0f172a', '#f472b6'],
  },
}

export function getTemplateCatalogEntry(code: string): TemplateCatalogEntry {
  return TEMPLATE_CATALOG[code] ?? DEFAULT_ENTRY(code)
}
