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
}

export interface WorkExperience {
  company?: string
  role?: string
  startDate?: string
  endDate?: string
  description?: string
}

export interface Education {
  degree?: string
  institution?: string
  startDate?: string
  endDate?: string
}

export interface Skill {
  name?: string
  progress?: number
}

export interface Project {
  title?: string
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
