-- ============================================
-- BOOKING SAAS — Neon PostgreSQL Schema
-- ============================================

-- 1. Establishments
CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID,
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

-- 2. Pools
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
    includes_bullets TEXT[] DEFAULT ARRAY[
        'Accès privé à la piscine',
        'Vestiaires & douches inclus',
        'Confirmation WhatsApp instantanée',
        'Annulation gratuite 24h avant'
    ],
    cancellation_policy_text TEXT DEFAULT 'Annulation gratuite jusqu''à 24h avant. Report possible sans frais.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Slot Configs
CREATE TABLE slot_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bookings
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

-- 5. Blockades
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
    SELECT EXISTS(
        SELECT 1 FROM bookings
        WHERE pool_id = p_pool_id
        AND booking_date = p_date
        AND slot_name = p_slot_name
        AND booking_status = 'confirmed'
        AND payment_status != 'refunded'
    ) INTO is_booked;

    SELECT EXISTS(
        SELECT 1 FROM blockades
        WHERE pool_id = p_pool_id
        AND block_date = p_date
        AND (slot_name = p_slot_name OR slot_name IS NULL)
    ) INTO is_blocked;

    RETURN NOT (is_booked OR is_blocked);
END;
$$ LANGUAGE plpgsql;
