-- Vacancy & Listing Management System
-- Multi-platform syndication, applicant tracking, and marketing analytics

-- Property Listings
CREATE TABLE IF NOT EXISTS property_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    listing_title TEXT NOT NULL,
    listing_description TEXT NOT NULL,
    short_description TEXT,
    property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'condo', 'townhouse', 'studio', 'commercial', 'other')),
    bedrooms NUMERIC NOT NULL DEFAULT 0,
    bathrooms NUMERIC NOT NULL DEFAULT 0,
    square_feet NUMERIC NOT NULL,
    monthly_rent NUMERIC NOT NULL,
    security_deposit NUMERIC NOT NULL,
    application_fee NUMERIC DEFAULT 0,
    pet_deposit NUMERIC DEFAULT 0,
    available_date DATE NOT NULL,
    lease_term_options TEXT[] NOT NULL,
    pet_policy TEXT NOT NULL CHECK (pet_policy IN ('allowed', 'not_allowed', 'cats_only', 'dogs_only', 'case_by_case')),
    pet_fee NUMERIC DEFAULT 0,
    smoking_policy TEXT NOT NULL CHECK (smoking_policy IN ('allowed', 'not_allowed', 'outside_only')),
    parking_spaces INTEGER DEFAULT 0,
    parking_type TEXT CHECK (parking_type IN ('garage', 'covered', 'uncovered', 'street', 'none')),
    laundry TEXT CHECK (laundry IN ('in_unit', 'shared', 'hookups', 'none')),
    utilities_included TEXT[],
    amenities TEXT[],
    features TEXT[],
    flooring_type TEXT[],
    heating_type TEXT,
    cooling_type TEXT,
    appliances TEXT[],
    furnished BOOLEAN DEFAULT FALSE,
    wheelchair_accessible BOOLEAN DEFAULT FALSE,
    income_requirement_multiplier NUMERIC DEFAULT 3.0,
    credit_score_minimum INTEGER DEFAULT 600,
    background_check_required BOOLEAN DEFAULT TRUE,
    employment_verification_required BOOLEAN DEFAULT TRUE,
    references_required INTEGER DEFAULT 2,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    virtual_tour_url TEXT,
    video_url TEXT,
    floor_plan_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'pending', 'rented', 'inactive')),
    featured BOOLEAN DEFAULT FALSE,
    featured_until DATE,
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    syndication_platforms TEXT[] DEFAULT ARRAY[]::TEXT[],
    last_syndicated_at TIMESTAMPTZ,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing Syndication
CREATE TABLE IF NOT EXISTS listing_syndications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES property_listings(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN (
        'zillow', 'apartments_com', 'trulia', 'realtor_com', 
        'craigslist', 'facebook_marketplace', 'rent_com', 
        'hotpads', 'zumper', 'company_website', 'other'
    )),
    external_listing_id TEXT,
    external_listing_url TEXT,
    syndication_status TEXT NOT NULL DEFAULT 'pending' CHECK (syndication_status IN (
        'pending', 'active', 'paused', 'expired', 'removed', 'error'
    )),
    syndicated_at TIMESTAMPTZ,
    last_updated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    cost_per_listing NUMERIC DEFAULT 0,
    auto_renew BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rental Applications
CREATE TABLE IF NOT EXISTS rental_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    listing_id UUID REFERENCES property_listings(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    application_number TEXT NOT NULL UNIQUE,
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Primary Applicant Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    ssn_last_four TEXT,
    drivers_license TEXT,
    current_address TEXT NOT NULL,
    current_city TEXT NOT NULL,
    current_state TEXT NOT NULL,
    current_zip TEXT NOT NULL,
    move_in_date DATE NOT NULL,
    lease_term_desired TEXT NOT NULL,
    
    -- Co-Applicants
    co_applicants JSONB DEFAULT '[]'::jsonb,
    
    -- Employment Info
    employment_status TEXT NOT NULL CHECK (employment_status IN ('employed', 'self_employed', 'unemployed', 'retired', 'student')),
    employer_name TEXT,
    employer_phone TEXT,
    job_title TEXT,
    employment_start_date DATE,
    monthly_income NUMERIC,
    additional_income NUMERIC DEFAULT 0,
    additional_income_source TEXT,
    
    -- Rental History
    current_landlord_name TEXT,
    current_landlord_phone TEXT,
    current_landlord_email TEXT,
    current_rent_amount NUMERIC,
    reason_for_moving TEXT,
    rental_history JSONB DEFAULT '[]'::jsonb,
    
    -- References
    personal_references JSONB DEFAULT '[]'::jsonb,
    emergency_contact JSONB NOT NULL,
    
    -- Pets & Vehicles
    has_pets BOOLEAN DEFAULT FALSE,
    pets JSONB DEFAULT '[]'::jsonb,
    has_vehicles BOOLEAN DEFAULT FALSE,
    vehicles JSONB DEFAULT '[]'::jsonb,
    
    -- Background & Credit
    credit_check_authorized BOOLEAN DEFAULT FALSE,
    background_check_authorized BOOLEAN DEFAULT FALSE,
    credit_score INTEGER,
    credit_check_date DATE,
    credit_report_url TEXT,
    background_check_status TEXT CHECK (background_check_status IN ('pending', 'clear', 'issues_found', 'failed')),
    background_check_date DATE,
    background_report_url TEXT,
    criminal_history BOOLEAN DEFAULT FALSE,
    criminal_history_details TEXT,
    eviction_history BOOLEAN DEFAULT FALSE,
    eviction_history_details TEXT,
    bankruptcy_history BOOLEAN DEFAULT FALSE,
    bankruptcy_history_details TEXT,
    
    -- Documents
    documents JSONB DEFAULT '[]'::jsonb,
    id_verification_url TEXT,
    income_verification_url TEXT,
    
    -- Application Status
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
        'draft', 'submitted', 'under_review', 'screening', 
        'approved', 'conditionally_approved', 'denied', 'withdrawn', 'expired'
    )),
    screening_status TEXT DEFAULT 'pending' CHECK (screening_status IN ('pending', 'in_progress', 'completed', 'failed')),
    application_fee_paid BOOLEAN DEFAULT FALSE,
    application_fee_amount NUMERIC DEFAULT 0,
    application_fee_date DATE,
    
    -- Review & Decision
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    denial_reason TEXT,
    approval_conditions TEXT[],
    approved_rent_amount NUMERIC,
    approved_deposit_amount NUMERIC,
    lease_start_date DATE,
    
    -- Scoring
    overall_score NUMERIC,
    income_score NUMERIC,
    credit_score_rating NUMERIC,
    rental_history_score NUMERIC,
    background_score NUMERIC,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Screening Results
CREATE TABLE IF NOT EXISTS application_screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES rental_applications(id) ON DELETE CASCADE,
    screening_type TEXT NOT NULL CHECK (screening_type IN ('credit', 'background', 'eviction', 'employment', 'reference')),
    provider TEXT CHECK (provider IN ('transunion', 'experian', 'equifax', 'checkr', 'other')),
    screening_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'error')),
    result TEXT CHECK (result IN ('pass', 'fail', 'review_required')),
    score NUMERIC,
    details JSONB DEFAULT '{}'::jsonb,
    report_url TEXT,
    cost NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Tracking
CREATE TABLE IF NOT EXISTS listing_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    listing_id UUID REFERENCES property_listings(id) ON DELETE CASCADE,
    lead_source TEXT NOT NULL CHECK (lead_source IN (
        'zillow', 'apartments_com', 'website', 'referral', 
        'walk_in', 'phone', 'email', 'social_media', 'other'
    )),
    lead_type TEXT NOT NULL CHECK (lead_type IN ('inquiry', 'showing_request', 'application', 'phone_call')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'text')),
    preferred_move_in_date DATE,
    budget_min NUMERIC,
    budget_max NUMERIC,
    lead_status TEXT NOT NULL DEFAULT 'new' CHECK (lead_status IN (
        'new', 'contacted', 'qualified', 'showing_scheduled', 
        'application_sent', 'applied', 'approved', 'leased', 
        'lost', 'unqualified', 'no_response'
    )),
    lead_score NUMERIC DEFAULT 0,
    contacted_at TIMESTAMPTZ,
    contacted_by TEXT,
    follow_up_date DATE,
    follow_up_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Showing Appointments
CREATE TABLE IF NOT EXISTS showing_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    listing_id UUID REFERENCES property_listings(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES listing_leads(id) ON DELETE SET NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT NOT NULL,
    showing_date DATE NOT NULL,
    showing_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    showing_type TEXT NOT NULL CHECK (showing_type IN ('in_person', 'virtual', 'self_guided')),
    agent_name TEXT,
    agent_email TEXT,
    special_instructions TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'completed', 'no_show', 'cancelled', 'rescheduled'
    )),
    confirmation_sent BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    interest_level TEXT CHECK (interest_level IN ('high', 'medium', 'low', 'none')),
    will_apply BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vacancy Cost Tracking
CREATE TABLE IF NOT EXISTS vacancy_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    vacancy_start_date DATE NOT NULL,
    vacancy_end_date DATE,
    days_vacant INTEGER,
    lost_rent_amount NUMERIC NOT NULL DEFAULT 0,
    turnover_costs NUMERIC DEFAULT 0,
    marketing_costs NUMERIC DEFAULT 0,
    maintenance_costs NUMERIC DEFAULT 0,
    utilities_costs NUMERIC DEFAULT 0,
    total_vacancy_cost NUMERIC DEFAULT 0,
    reason_for_vacancy TEXT CHECK (reason_for_vacancy IN (
        'tenant_moved_out', 'eviction', 'renovation', 
        'seasonal', 'new_property', 'other'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing Performance Analytics
CREATE TABLE IF NOT EXISTS marketing_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    listing_id UUID REFERENCES property_listings(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    platform TEXT NOT NULL,
    impressions INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    inquiries INTEGER DEFAULT 0,
    applications INTEGER DEFAULT 0,
    showings INTEGER DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    conversion_rate NUMERIC DEFAULT 0,
    cost_per_lead NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing Photos Management
CREATE TABLE IF NOT EXISTS listing_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES property_listings(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_title TEXT,
    photo_description TEXT,
    photo_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    room_type TEXT CHECK (room_type IN (
        'exterior', 'living_room', 'kitchen', 'bedroom', 'bathroom', 
        'dining_room', 'office', 'garage', 'amenity', 'other'
    )),
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_listings_company ON property_listings(company_id);
CREATE INDEX IF NOT EXISTS idx_property_listings_property ON property_listings(property_id);
CREATE INDEX IF NOT EXISTS idx_property_listings_status ON property_listings(status);
CREATE INDEX IF NOT EXISTS idx_property_listings_available_date ON property_listings(available_date);
CREATE INDEX IF NOT EXISTS idx_listing_syndications_listing ON listing_syndications(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_syndications_platform ON listing_syndications(platform);
CREATE INDEX IF NOT EXISTS idx_rental_applications_company ON rental_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_rental_applications_listing ON rental_applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_rental_applications_status ON rental_applications(status);
CREATE INDEX IF NOT EXISTS idx_rental_applications_email ON rental_applications(email);
CREATE INDEX IF NOT EXISTS idx_application_screenings_application ON application_screenings(application_id);
CREATE INDEX IF NOT EXISTS idx_listing_leads_company ON listing_leads(company_id);
CREATE INDEX IF NOT EXISTS idx_listing_leads_listing ON listing_leads(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_leads_status ON listing_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_showing_appointments_listing ON showing_appointments(listing_id);
CREATE INDEX IF NOT EXISTS idx_showing_appointments_date ON showing_appointments(showing_date);
CREATE INDEX IF NOT EXISTS idx_vacancy_costs_property ON vacancy_costs(property_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_listing ON marketing_analytics(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_date ON marketing_analytics(date);

-- Enable RLS
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_syndications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE showing_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancy_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company access to property listings" ON property_listings
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to listing syndications" ON listing_syndications
    FOR ALL USING (EXISTS (
        SELECT 1 FROM property_listings WHERE property_listings.id = listing_syndications.listing_id 
        AND property_listings.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to rental applications" ON rental_applications
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to application screenings" ON application_screenings
    FOR ALL USING (EXISTS (
        SELECT 1 FROM rental_applications WHERE rental_applications.id = application_screenings.application_id 
        AND rental_applications.company_id = current_setting('app.current_company_id', true)
    ));

CREATE POLICY "Company access to listing leads" ON listing_leads
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to showing appointments" ON showing_appointments
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to vacancy costs" ON vacancy_costs
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to marketing analytics" ON marketing_analytics
    FOR ALL USING (company_id = current_setting('app.current_company_id', true));

CREATE POLICY "Company access to listing photos" ON listing_photos
    FOR ALL USING (EXISTS (
        SELECT 1 FROM property_listings WHERE property_listings.id = listing_photos.listing_id 
        AND property_listings.company_id = current_setting('app.current_company_id', true)
    ));

-- Function to calculate lead score
CREATE OR REPLACE FUNCTION calculate_lead_score()
RETURNS TRIGGER AS $$
DECLARE
    score NUMERIC := 0;
BEGIN
    -- Budget alignment (0-30 points)
    IF NEW.budget_max >= (SELECT monthly_rent FROM property_listings WHERE id = NEW.listing_id) THEN
        score := score + 30;
    ELSIF NEW.budget_min <= (SELECT monthly_rent FROM property_listings WHERE id = NEW.listing_id) THEN
        score := score + 15;
    END IF;
    
    -- Contact info completeness (0-20 points)
    IF NEW.phone IS NOT NULL THEN score := score + 10; END IF;
    IF NEW.email IS NOT NULL THEN score := score + 10; END IF;
    
    -- Move-in timeline (0-20 points)
    IF NEW.preferred_move_in_date <= CURRENT_DATE + INTERVAL '30 days' THEN
        score := score + 20;
    ELSIF NEW.preferred_move_in_date <= CURRENT_DATE + INTERVAL '60 days' THEN
        score := score + 10;
    END IF;
    
    -- Message quality (0-15 points)
    IF LENGTH(NEW.message) > 100 THEN score := score + 15;
    ELSIF LENGTH(NEW.message) > 50 THEN score := score + 8;
    END IF;
    
    -- Lead source quality (0-15 points)
    IF NEW.lead_source IN ('referral', 'website') THEN score := score + 15;
    ELSIF NEW.lead_source IN ('zillow', 'apartments_com') THEN score := score + 10;
    END IF;
    
    NEW.lead_score := score;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_lead_score
    BEFORE INSERT OR UPDATE ON listing_leads
    FOR EACH ROW
    EXECUTE FUNCTION calculate_lead_score();

-- Function to update listing view count
CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE property_listings
    SET views_count = views_count + 1
    WHERE id = NEW.listing_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate vacancy costs
CREATE OR REPLACE FUNCTION calculate_vacancy_cost()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.vacancy_end_date IS NOT NULL THEN
        NEW.days_vacant := NEW.vacancy_end_date - NEW.vacancy_start_date;
        
        -- Calculate lost rent
        SELECT monthly_rent * (NEW.days_vacant::NUMERIC / 30) INTO NEW.lost_rent_amount
        FROM properties
        WHERE id = NEW.property_id;
        
        -- Calculate total cost
        NEW.total_vacancy_cost := NEW.lost_rent_amount + 
                                  COALESCE(NEW.turnover_costs, 0) + 
                                  COALESCE(NEW.marketing_costs, 0) + 
                                  COALESCE(NEW.maintenance_costs, 0) + 
                                  COALESCE(NEW.utilities_costs, 0);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_vacancy_cost
    BEFORE INSERT OR UPDATE ON vacancy_costs
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vacancy_cost();
