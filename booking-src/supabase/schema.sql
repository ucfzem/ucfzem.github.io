-- ============================================
-- BOOKING SAAS — Schéma Supabase (PostgreSQL)
-- ============================================

-- 1. Propriétaires / Établissements
CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    whatsapp_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    description TEXT,
    tagline VARCHAR(255) DEFAULT 'Réservez en quelques clics',
    cancellation_policy_text TEXT DEFAULT 'Annulation gratuite jusqu''à 24h avant votre réservation.',
    next_steps_override TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Piscines / Espaces
CREATE TABLE pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    max_capacity INT NOT NULL,
    price_per_slot NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MAD',
    ical_sync_url TEXT,
    is_active BOOLEAN DEFAULT true,
    -- Dynamic copy fields
    includes_bullets TEXT[] DEFAULT ARRAY[
        'Accès privé à la piscine',
        'Vestiaires & douches inclus',
        'Confirmation WhatsApp instantanée',
        'Annulation gratuite 24h avant'
    ],
    cancellation_policy_text TEXT DEFAULT 'Annulation gratuite jusqu''à 24h avant. Report possible sans frais.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créneaux Types (Configurations)
CREATE TABLE slot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Réservations
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    slot_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guests_count INT NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'pending',
    booking_status VARCHAR(50) DEFAULT 'confirmed',
    source VARCHAR(50) DEFAULT 'direct',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bloquages manuels (propriétaire)
CREATE TABLE blockades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
    block_date DATE NOT NULL,
    slot_name VARCHAR(100),
    start_time TIME,
    end_time TIME,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_bookings_pool_date ON bookings(pool_id, booking_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status, payment_status);
CREATE INDEX idx_pools_establishment ON pools(establishment_id);
CREATE INDEX idx_slot_configs_pool ON slot_configs(pool_id);
CREATE INDEX idx_establishments_slug ON establishments(slug);
CREATE INDEX idx_blockades_pool_date ON blockades(pool_id, block_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockades ENABLE ROW LEVEL SECURITY;

-- Establishments: Owner can manage their own
CREATE POLICY "Owners manage their establishments"
ON establishments FOR ALL
USING (auth.uid() = owner_id);

-- Establishments: Public can read by slug (for booking page)
CREATE POLICY "Public can view establishments"
ON establishments FOR SELECT
USING (true);

-- Pools: Owner can manage via their establishment
CREATE POLICY "Owners manage their pools"
ON pools FOR ALL
USING (
    establishment_id IN (
        SELECT id FROM establishments WHERE owner_id = auth.uid()
    )
);

-- Pools: Public can read active pools
CREATE POLICY "Public can view active pools"
ON pools FOR SELECT
USING (is_active = true);

-- Slot configs: Owner can manage via pool -> establishment
CREATE POLICY "Owners manage their slot configs"
ON slot_configs FOR ALL
USING (
    pool_id IN (
        SELECT p.id FROM pools p
        JOIN establishments e ON p.establishment_id = e.id
        WHERE e.owner_id = auth.uid()
    )
);

-- Slot configs: Public can read
CREATE POLICY "Public can view slot configs"
ON slot_configs FOR SELECT
USING (is_active = true);

-- Bookings: Owner can manage via pool -> establishment
CREATE POLICY "Owners manage their bookings"
ON bookings FOR ALL
USING (
    pool_id IN (
        SELECT p.id FROM pools p
        JOIN establishments e ON p.establishment_id = e.id
        WHERE e.owner_id = auth.uid()
    )
);

-- Bookings: Anyone can create (public booking)
CREATE POLICY "Anyone can create bookings"
ON bookings FOR INSERT
WITH CHECK (true);

-- Blockades: Owner can manage
CREATE POLICY "Owners manage their blockades"
ON blockades FOR ALL
USING (
    pool_id IN (
        SELECT p.id FROM pools p
        JOIN establishments e ON p.establishment_id = e.id
        WHERE e.owner_id = auth.uid()
    )
);

-- ============================================
-- FUNCTION: Check slot availability
-- ============================================
CREATE OR REPLACE FUNCTION check_slot_availability(
    p_pool_id UUID,
    p_date DATE,
    p_slot_name VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    is_booked BOOLEAN;
    is_blocked BOOLEAN;
BEGIN
    -- Check if slot is booked
    SELECT EXISTS(
        SELECT 1 FROM bookings
        WHERE pool_id = p_pool_id
        AND booking_date = p_date
        AND slot_name = p_slot_name
        AND booking_status = 'confirmed'
        AND payment_status != 'refunded'
    ) INTO is_booked;

    -- Check if slot is blocked
    SELECT EXISTS(
        SELECT 1 FROM blockades
        WHERE pool_id = p_pool_id
        AND block_date = p_date
        AND (slot_name = p_slot_name OR slot_name IS NULL)
    ) INTO is_blocked;

    RETURN NOT (is_booked OR is_blocked);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
