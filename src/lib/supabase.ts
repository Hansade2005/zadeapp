import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  location?: string
  bio?: string
  user_type: 'buyer' | 'seller' | 'freelancer' | 'employer' | 'admin'
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  original_price?: number
  category: string
  subcategory?: string
  images: string[]
  stock_quantity: number
  is_active: boolean
  featured: boolean
  tags: string[]
  location?: string
  condition: 'new' | 'used' | 'refurbished'
  brand?: string
  warranty?: string
  delivery_available: boolean
  delivery_fee?: number
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  employer_id: string
  title: string
  company: string
  description: string
  requirements: string[]
  location: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance'
  salary_min?: number
  salary_max?: number
  salary_currency: string
  experience_level: 'entry' | 'mid' | 'senior' | 'executive'
  category: string
  skills_required: string[]
  application_deadline?: string
  is_active: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  organizer_id: string
  title: string
  description: string
  category: string
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  location: string
  venue?: string
  price: number
  max_attendees?: number
  current_attendees: number
  images: string[]
  tags: string[]
  is_active: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export interface FreelancerProfile {
  id: string
  user_id: string
  title: string
  bio: string
  skills: string[]
  hourly_rate: number
  currency: string
  portfolio_url?: string
  linkedin_url?: string
  github_url?: string
  experience_years: number
  languages: string[]
  availability_status: 'available' | 'busy' | 'unavailable'
  rating: number
  total_reviews: number
  completed_jobs: number
  response_time_hours: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  buyer_id: string
  seller_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  delivery_fee: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  delivery_address: {
    street: string
    city: string
    state: string
    postal_code?: string
    country: string
  }
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  job_id: string
  applicant_id: string
  cover_letter: string
  resume_url?: string
  portfolio_url?: string
  expected_salary?: number
  availability_date?: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'accepted' | 'rejected'
  notes?: string
  created_at: string
  updated_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  ticket_type: 'regular' | 'vip' | 'early_bird'
  quantity: number
  total_price: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  attended: boolean
  check_in_time?: string
  created_at: string
  updated_at: string
}

export interface FreelanceHire {
  id: string
  freelancer_id: string
  client_id: string
  project_title: string
  project_description: string
  budget: number
  currency: string
  timeline_days: number
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'released' | 'disputed'
  contract_url?: string
  deliverables: string[]
  milestones: {
    title: string
    description: string
    amount: number
    due_date: string
    status: 'pending' | 'completed' | 'paid'
  }[]
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'order' | 'job_application' | 'event_reminder' | 'message' | 'system'
  title: string
  message: string
  is_read: boolean
  action_url?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  subject: string
  content: string
  is_read: boolean
  thread_id?: string
  attachments?: string[]
  created_at: string
  updated_at: string
}

export interface AdminStats {
  id: string
  total_users: number
  total_products: number
  total_jobs: number
  total_events: number
  total_orders: number
  total_revenue: number
  active_users_today: number
  new_registrations_today: number
  created_at: string
  updated_at: string
}