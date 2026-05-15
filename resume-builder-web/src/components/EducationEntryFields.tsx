import {
  CLASS_TYPE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EDUCATION_STATUS_OPTIONS,
  isUniversityEducationLevel,
  REGION_OPTIONS,
  UNIVERSITY_TYPE_OPTIONS,
} from '../data/educationOptions'
import type { Education } from '../types/models'

type Props = {
  value: Education
  onChange: (next: Education) => void
}

function FieldSelect({
  label,
  value,
  options,
  onChange,
  required,
  disabled,
  placeholderInList,
}: {
  label: string
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (v: string) => void
  required?: boolean
  disabled?: boolean
  placeholderInList?: string
}) {
  return (
    <label className={`field field--select${disabled ? ' field--select-disabled' : ''}`}>
      <span className="field--select-label">
        {label}
        {required ? <span className="field__required"> *</span> : null}
      </span>
      <div className="field-select-wrap">
        <select
          className="field-select"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          {placeholderInList ? (
            <option value="" disabled>
              {placeholderInList}
            </option>
          ) : null}
          {options
            .filter((opt) => opt.value !== '')
            .map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      </div>
    </label>
  )
}

export function EducationEntryFields({ value: ed, onChange: upd }: Props) {
  const showUniversity = isUniversityEducationLevel(ed.level)

  return (
    <div className="education-entry portal-block">
      <div className="education-entry__selects">
        <FieldSelect
          label="학력 구분"
          required
          value={ed.level ?? ''}
          options={EDUCATION_LEVEL_OPTIONS}
          onChange={(level) => {
            const next: Education = { ...ed, level }
            if (!isUniversityEducationLevel(level)) {
              next.schoolType = ''
              next.major = ''
              next.transfer = false
              next.classType = ''
            }
            upd(next)
          }}
        />
        <FieldSelect
          label="대학구분"
          required
          placeholderInList="대학구분 *"
          value={ed.schoolType ?? ''}
          options={UNIVERSITY_TYPE_OPTIONS}
          disabled={!showUniversity}
          onChange={(schoolType) => {
            const next: Education = { ...ed, schoolType, degree: schoolType || ed.degree }
            if (schoolType && !isUniversityEducationLevel(ed.level)) {
              next.level = '대학·대학원 이상 졸업'
            }
            upd(next)
          }}
        />
        <FieldSelect
          label="상태"
          value={ed.status ?? ''}
          options={EDUCATION_STATUS_OPTIONS}
          onChange={(status) => upd({ ...ed, status })}
        />
      </div>
      {!showUniversity ? (
        <p className="education-entry__hint muted small">
          학력 구분에서 「대학·대학원 이상 졸업」을 선택하면 대학구분을 고를 수 있습니다.
        </p>
      ) : null}

      <div className="education-entry__school-row">
        <label className="field education-entry__school">
          <span>학교명{showUniversity ? <span className="field__required"> *</span> : null}</span>
          <input
            value={ed.institution ?? ''}
            placeholder="학교명 검색·입력"
            onChange={(e) => upd({ ...ed, institution: e.target.value })}
          />
        </label>
        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={Boolean(ed.transfer)}
            disabled={!showUniversity}
            onChange={(e) => upd({ ...ed, transfer: e.target.checked })}
          />
          <span>편입</span>
        </label>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>전공{showUniversity ? <span className="field__required"> *</span> : null}</span>
          <input
            value={ed.major ?? ''}
            placeholder="예: 컴퓨터소프트웨어과"
            disabled={!showUniversity}
            onChange={(e) => upd({ ...ed, major: e.target.value })}
          />
        </label>
        <label className="field">
          <span>입학년월</span>
          <input
            value={ed.startDate ?? ''}
            placeholder="201903"
            inputMode="numeric"
            maxLength={6}
            onChange={(e) => upd({ ...ed, startDate: e.target.value.replace(/\D/g, '').slice(0, 6) })}
          />
        </label>
        <label className="field">
          <span>졸업년월</span>
          <input
            value={ed.endDate ?? ''}
            placeholder="202302"
            inputMode="numeric"
            maxLength={6}
            onChange={(e) => upd({ ...ed, endDate: e.target.value.replace(/\D/g, '').slice(0, 6) })}
          />
        </label>
        <FieldSelect
          label="주·야"
          value={ed.classType ?? ''}
          options={CLASS_TYPE_OPTIONS}
          disabled={!showUniversity}
          onChange={(classType) => upd({ ...ed, classType })}
        />
        <FieldSelect
          label="지역"
          value={ed.location ?? ''}
          options={REGION_OPTIONS}
          onChange={(location) => upd({ ...ed, location })}
        />
      </div>
    </div>
  )
}
