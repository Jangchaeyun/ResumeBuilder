import type { Project } from '../types/models'

type Props = {
  value: Project
  onChange: (next: Project) => void
}

export function ProjectEntryFields({ value: pj, onChange: upd }: Props) {
  return (
    <div className="project-entry portal-block">
      <label className="field">
        <span>
          프로젝트명<span className="field__required"> *</span>
        </span>
        <input
          value={pj.title ?? ''}
          placeholder="예: 스포츠 브랜드 쇼핑몰 웹페이지 개발"
          onChange={(e) => upd({ ...pj, title: e.target.value })}
        />
      </label>
      <label className="field">
        <span>사용 기술</span>
        <input
          value={pj.technologies ?? ''}
          placeholder="React, Node.js, MongoDB (PDF에는 React·Node.js·MongoDB 형태로 표시)"
          onChange={(e) => upd({ ...pj, technologies: e.target.value })}
        />
      </label>
      <label className="field">
        <span>담당 역할</span>
        <input
          value={pj.role ?? ''}
          placeholder="예: 풀스택 개발"
          onChange={(e) => upd({ ...pj, role: e.target.value })}
        />
      </label>
      <label className="field">
        <span>주요 내용</span>
        <textarea
          className="project-entry__desc"
          rows={5}
          value={pj.description ?? ''}
          placeholder={
            '한 줄에 하나씩 작성하세요. 줄 앞에 → 를 붙이면 PDF에 그대로 반영됩니다.\n→ 회원가입·주문·리뷰 기능 구현 및 데이터 구조 설계\n→ API 연동 및 배포 자동화'
          }
          onChange={(e) => upd({ ...pj, description: e.target.value })}
        />
      </label>
      <div className="field-grid">
        <label className="field">
          <span>GitHub</span>
          <input
            value={pj.github ?? ''}
            placeholder="https://github.com/..."
            onChange={(e) => upd({ ...pj, github: e.target.value })}
          />
        </label>
        <label className="field">
          <span>배포 URL</span>
          <input
            value={pj.liveDemo ?? ''}
            placeholder="https://..."
            onChange={(e) => upd({ ...pj, liveDemo: e.target.value })}
          />
        </label>
      </div>
    </div>
  )
}
