export interface AuthResponse {
  id: string
  name: string
  email: string
  profileImageUrl?: string | null
  subscriptionPlan?: string | null
  emailVerified: boolean
  token?: string
  createdAt?: string
  updatedAt?: string
}

export interface ResumeTemplate {
  theme?: string
  colorPlette?: string[]
}

export interface ProfileInfo {
  profileReviewUrl?: string
  fullName?: string
  designation?: string
  summary?: string
}

export interface ContactInfo {
  email?: string
  phone?: string
  location?: string
  linkedIn?: string
  github?: string
  website?: string
  techBlog?: string
}

export interface WorkExperience {
  company?: string
  role?: string
  startDate?: string
  endDate?: string
  /** 쉼표로 구분 (예: Java, Spring Boot, React) */
  technologies?: string
  /** 주요 성과 (줄바꿈으로 항목 구분 가능) */
  highlights?: string
  description?: string
}

export interface Education {
  /** 학력 구분 (초등학교 졸업, 대학·대학원 이상 졸업 등) */
  level?: string
  /** 대학·대학원: 대학(4년), 대학원(석사) 등 */
  schoolType?: string
  /** 졸업, 재학, 휴학 등 */
  status?: string
  degree?: string
  major?: string
  institution?: string
  transfer?: boolean
  startDate?: string
  endDate?: string
  classType?: string
  location?: string
}

export interface Skill {
  name?: string
  progress?: number
}

export interface Project {
  title?: string
  role?: string
  technologies?: string
  description?: string
  github?: string
  liveDemo?: string
}

export interface Certification {
  title?: string
  issuer?: string
  year?: string
}

export interface Language {
  name?: string
  progress?: number
}

export interface Resume {
  id: string
  userId?: string
  title: string
  thumbnailLink?: string
  template?: ResumeTemplate | null
  profileInfo?: ProfileInfo | null
  contactInfo?: ContactInfo | null
  workExperiences?: WorkExperience[]
  educations?: Education[]
  skills?: Skill[]
  projects?: Project[]
  certifications?: Certification[]
  languages?: Language[]
  interests?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface TemplatesResponse {
  availableTemplates: string[]
  allTemplates: string[]
  subscription?: string | null
  isPremium: boolean
}

export interface PaymentOrderResponse {
  orderId: string
  amount: number
  currency: string
}

export interface PaymentRecord {
  id?: string
  _id?: string
  userId?: string
  paymentKey?: string
  orderId?: string
  amount?: number
  currency?: string
  planType?: string
  status?: string
  method?: string
  receiptUrl?: string
  approvedAt?: string
  createdAt?: string
}
