-- 🧱 ADMIN TABLE
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 💖 DONOR TABLE
CREATE TABLE IF NOT EXISTS donors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 🏢 NGO TABLE
CREATE TABLE IF NOT EXISTS ngos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 🙋 VOLUNTEER TABLE
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES ngos(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('Books', 'Clothes', 'Food', 'Money', 'Electronics', 'Other')),
  amount NUMERIC,
  quantity INT,
  description TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Completed', 'Cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE favorite_ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (donor_id, ngo_id)
);
CREATE TABLE donor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_role TEXT CHECK (sender_role IN ('donor', 'ngo')),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE donor_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
  total_donations INT DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  ngos_helped INT DEFAULT 0,
  donor_level TEXT DEFAULT 'Bronze' CHECK (donor_level IN ('Bronze', 'Silver', 'Gold')),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.donations
  ALTER COLUMN category SET DATA TYPE TEXT,
  ALTER COLUMN category DROP DEFAULT;

ALTER TABLE public.donations
  DROP CONSTRAINT IF EXISTS donations_category_check;

ALTER TABLE public.donations
  ADD CONSTRAINT donations_category_check
  CHECK (
    category IN (
      'Books','Clothes','Food','Money','Electronics','Toys','Stationery','Medical Supplies','Other'
    )
  );

  ALTER TABLE donors
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;


-- ✅ Update donations table
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS ngo_feedback TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

ALTER TABLE donations
DROP CONSTRAINT IF EXISTS donations_category_check;

ALTER TABLE donations
ADD CONSTRAINT donations_category_check
CHECK (
  category IN (
    'Books',
    'Clothes',
    'Food',
    'Money',
    'Electronics',
    'Toys',
    'Stationery',
    'Medical Supplies',
    'Furniture',
    'Groceries',
    'Hygiene Kits',
    'Other'
  )
);

-- 🕓 Add timeline tracking table for history
CREATE TABLE IF NOT EXISTS donation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  note TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE donations
ADD COLUMN IF NOT EXISTS donor_rating INT CHECK (donor_rating BETWEEN 1 AND 5);

ALTER TABLE donor_impact
ADD COLUMN avg_donation_value NUMERIC DEFAULT 0,
ADD COLUMN recent_donation_date TIMESTAMP,
ADD COLUMN top_category TEXT,
ADD COLUMN progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100);


CREATE TABLE ngo_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  total_donations INT DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  total_donors INT DEFAULT 0,
  total_volunteers INT DEFAULT 0,
  active_campaigns INT DEFAULT 0,
  top_category TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE donations
ADD COLUMN IF NOT EXISTS assigned_volunteer UUID REFERENCES volunteers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;


ALTER TABLE ngos
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rating NUMERIC CHECK (rating BETWEEN 0 AND 5),
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;
CREATE TABLE IF NOT EXISTS ngo_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  title TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ngo_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ngo_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (donor_id, ngo_id)
);
CREATE TABLE IF NOT EXISTS ngo_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In Progress', 'Delivered', 'Cancelled')),
  notes TEXT,
  assigned_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ngo_volunteer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_role TEXT CHECK (sender_role IN ('ngo', 'volunteer')),
  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE ngo_impact
ADD COLUMN IF NOT EXISTS monthly_growth_percent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS donor_retention_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_donation_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0 CHECK (rating BETWEEN 0 AND 5);



CREATE TABLE IF NOT EXISTS volunteer_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  total_tasks INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  cancelled_tasks INT DEFAULT 0,
  active_tasks INT DEFAULT 0,
  ngos_helped INT DEFAULT 0,
  performance_level TEXT DEFAULT 'Beginner' CHECK (performance_level IN ('Beginner','Active','Leader','Hero')),
  last_active TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS volunteer_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  total_tasks INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  cancelled_tasks INT DEFAULT 0,
  active_tasks INT DEFAULT 0,
  ngos_helped INT DEFAULT 0,
  performance_level TEXT DEFAULT 'Beginner' CHECK (
    performance_level IN ('Beginner', 'Active', 'Leader', 'Hero')
  ),
  average_completion_time INTERVAL,
  success_rate NUMERIC DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS volunteer_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  related_task UUID REFERENCES volunteer_assignments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ngo_volunteer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_role TEXT CHECK (sender_role IN ('ngo', 'volunteer')),
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_messages
ON ngo_volunteer_messages (volunteer_id, ngo_id);
ALTER TABLE volunteer_assignments
ADD COLUMN IF NOT EXISTS completion_notes TEXT,
ADD COLUMN IF NOT EXISTS completion_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS rating INT CHECK (rating BETWEEN 1 AND 5);
CREATE OR REPLACE FUNCTION update_volunteer_impact()
RETURNS TRIGGER AS $$
BEGIN
  -- Count totals
  UPDATE volunteer_impact
  SET
    total_tasks = (SELECT COUNT(*) FROM volunteer_assignments WHERE volunteer_id = NEW.volunteer_id),
    completed_tasks = (SELECT COUNT(*) FROM volunteer_assignments WHERE volunteer_id = NEW.volunteer_id AND status = 'Delivered'),
    cancelled_tasks = (SELECT COUNT(*) FROM volunteer_assignments WHERE volunteer_id = NEW.volunteer_id AND status = 'Cancelled'),
    active_tasks = (SELECT COUNT(*) FROM volunteer_assignments WHERE volunteer_id = NEW.volunteer_id AND status = 'In Progress'),
    last_active = NOW(),
    updated_at = NOW()
  WHERE volunteer_id = NEW.volunteer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_volunteer_impact
AFTER INSERT OR UPDATE OF status ON volunteer_assignments
FOR EACH ROW
EXECUTE FUNCTION update_volunteer_impact();

-- 🧩 Add NGO relationship to volunteers
ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS ngo_id UUID REFERENCES ngos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

CREATE TABLE IF NOT EXISTS ngo_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (ngo_id, volunteer_id)
);



-- Add ngo_id and contact fields if missing
ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS ngo_id UUID REFERENCES ngos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Optional: if you want volunteers to choose multiple NGOs
CREATE TABLE IF NOT EXISTS ngo_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (ngo_id, volunteer_id)
);
-- 1️⃣ Create the trigger function
CREATE OR REPLACE FUNCTION log_volunteer_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert activity when status changes
  IF (TG_OP = 'UPDATE' AND NEW.status <> OLD.status) THEN
    INSERT INTO volunteer_activity (volunteer_id, action, details, related_task, created_at)
    VALUES (
      NEW.volunteer_id,
      CASE
        WHEN NEW.status = 'Delivered' THEN 'Task Completed'
        WHEN NEW.status = 'In Progress' THEN 'Task In Progress'
        WHEN NEW.status = 'Cancelled' THEN 'Task Cancelled'
        ELSE 'Task Updated'
      END,
      CONCAT('Task status changed from ', OLD.status, ' to ', NEW.status),
      NEW.id,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2️⃣ Attach the trigger to volunteer_assignments
DROP TRIGGER IF EXISTS trg_log_volunteer_activity ON volunteer_assignments;

CREATE TRIGGER trg_log_volunteer_activity
AFTER UPDATE OF status ON volunteer_assignments
FOR EACH ROW
EXECUTE FUNCTION log_volunteer_activity();

INSERT INTO volunteer_activity (volunteer_id, action, details, related_task, created_at)
SELECT
  volunteer_id,
  CASE
    WHEN status = 'Delivered' THEN 'Task Completed'
    WHEN status = 'In Progress' THEN 'Task In Progress'
    WHEN status = 'Cancelled' THEN 'Task Cancelled'
    ELSE 'Task Assigned'
  END,
  CONCAT('Existing task status: ', status),
  id,
  NOW()
FROM volunteer_assignments;







ALTER TABLE donations
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS ngo_feedback TEXT,
ADD COLUMN IF NOT EXISTS donor_rating INT CHECK (donor_rating BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS assigned_volunteer UUID REFERENCES volunteers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
CREATE TABLE IF NOT EXISTS donation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  note TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In Progress', 'Delivered', 'Cancelled')),
  notes TEXT,
  assigned_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completion_time TIMESTAMP,
  rating INT CHECK (rating BETWEEN 1 AND 5)
);
CREATE OR REPLACE FUNCTION log_volunteer_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status <> OLD.status) THEN
    INSERT INTO volunteer_activity (volunteer_id, action, details, related_task, created_at)
    VALUES (
      NEW.volunteer_id,
      CASE
        WHEN NEW.status = 'Delivered' THEN 'Task Completed'
        WHEN NEW.status = 'In Progress' THEN 'Task Started'
        WHEN NEW.status = 'Cancelled' THEN 'Task Cancelled'
        ELSE 'Task Updated'
      END,
      CONCAT('Status changed from ', OLD.status, ' to ', NEW.status),
      NEW.id,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_volunteer_activity ON volunteer_assignments;

CREATE TRIGGER trg_log_volunteer_activity
AFTER UPDATE OF status ON volunteer_assignments
FOR EACH ROW
EXECUTE FUNCTION log_volunteer_activity();

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available' CHECK (status IN ('Available','Busy','Offline')),
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

DROP TABLE IF EXISTS volunteer_impact CASCADE;

CREATE TABLE volunteer_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  total_tasks INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  cancelled_tasks INT DEFAULT 0,
  active_tasks INT DEFAULT 0,
  ngos_helped INT DEFAULT 0,
  performance_level TEXT DEFAULT 'Beginner' CHECK (
    performance_level IN ('Beginner','Active','Leader','Hero')
  ),
  average_completion_time INTERVAL,
  success_rate NUMERIC DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(volunteer_id)
);
CREATE OR REPLACE FUNCTION create_volunteer_impact_row()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO volunteer_impact (volunteer_id)
  VALUES (NEW.id)
  ON CONFLICT (volunteer_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_volunteer_impact_row ON volunteers;

CREATE TRIGGER trg_create_volunteer_impact_row
AFTER INSERT ON volunteers
FOR EACH ROW
EXECUTE FUNCTION create_volunteer_impact_row();

ALTER TABLE volunteer_assignments
ADD CONSTRAINT unique_active_assignment
UNIQUE (donation_id);

ALTER TABLE donors
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE donations
ADD COLUMN IF NOT EXISTS pickup_address TEXT,
ADD COLUMN IF NOT EXISTS donor_phone TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT;


CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who sent the message
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (
    sender_role IN ('donor', 'ngo', 'volunteer')
  ),

  -- Who should receive the message
  receiver_id UUID NOT NULL,
  receiver_role TEXT NOT NULL CHECK (
    receiver_role IN ('donor', 'ngo', 'volunteer')
  ),

  -- The message itself
  message TEXT NOT NULL,

  -- Read / unread system
  read_status BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Faster lookup
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who sent the message
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (
    sender_role IN ('donor', 'ngo', 'volunteer')
  ),

  -- Who receives the message
  receiver_id UUID NOT NULL,
  receiver_role TEXT NOT NULL CHECK (
    receiver_role IN ('donor', 'ngo', 'volunteer')
  ),

  -- Message content
  message TEXT NOT NULL,

  -- Seen status
  read_status BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_pair ON messages(sender_id, receiver_id);
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
CHECK (message_type IN ('text','image','audio','file','emoji','system'));
DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who sent
  sender_id UUID NOT NULL,
  sender_role TEXT NOT NULL CHECK (
    sender_role IN ('donor', 'ngo', 'volunteer')
  ),

  -- Who receives
  receiver_id UUID NOT NULL,
  receiver_role TEXT NOT NULL CHECK (
    receiver_role IN ('donor', 'ngo', 'volunteer')
  ),

  -- Text content (if applicable)
  message TEXT,

  -- Attachment or media URL
  media_url TEXT,

  -- Message type
  message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text','image','audio','file','emoji','system')),

  -- Read indicator
  read_status BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_pair ON messages(sender_id, receiver_id);
INSERT INTO messages (id, sender_id, sender_role, receiver_id, receiver_role, message, message_type, read_status, created_at)
SELECT
  id,
  donor_id AS sender_id,
  'donor' AS sender_role,
  ngo_id AS receiver_id,
  'ngo' AS receiver_role,
  message,
  'text' AS message_type,
  FALSE AS read_status,
  created_at
FROM donor_messages
WHERE message IS NOT NULL;

CREATE TABLE IF NOT EXISTS ngo_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount NUMERIC,
  raised_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Paused')),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION update_ngo_impact(ngo UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ngo_impact
  SET
    total_donations = (SELECT COUNT(*) FROM donations WHERE ngo_id = ngo),
    total_value = (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE ngo_id = ngo),
    total_donors = (SELECT COUNT(DISTINCT donor_id) FROM donations WHERE ngo_id = ngo),
    total_volunteers = (SELECT COUNT(*) FROM ngo_volunteers WHERE ngo_id = ngo),
    active_campaigns = (SELECT COUNT(*) FROM ngo_campaigns WHERE ngo_id = ngo AND status='Active'),
    top_category = (
      SELECT category
      FROM donations
      WHERE ngo_id = ngo
      GROUP BY category
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ),
    updated_at = NOW()
  WHERE ngo_id = ngo;
END;
$$ LANGUAGE plpgsql;
-- trigger function that uses NEW.ngo_id
CREATE OR REPLACE FUNCTION trg_fn_update_ngo_impact()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- call your existing function (update_ngo_impact) passing ngo_id from NEW
  PERFORM update_ngo_impact(NEW.ngo_id);
  RETURN NEW; -- for AFTER triggers return value is ignored but RETURN NEW is conventional
END;
$$;

-- create trigger that calls the trigger function
CREATE TRIGGER trg_update_impact_donations
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION trg_fn_update_ngo_impact();
ALTER TABLE ngos
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE ngos
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_accuracy DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS map_source TEXT DEFAULT 'manual' 
  CHECK (map_source IN ('manual','gps','auto')),
ADD COLUMN IF NOT EXISTS formatted_address TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT;

ALTER TABLE ngos
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_accuracy DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS formatted_address TEXT,
ADD COLUMN IF NOT EXISTS map_source TEXT DEFAULT 'manual'
  CHECK (map_source IN ('manual','gps','auto')),
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rating NUMERIC CHECK (rating BETWEEN 0 AND 5),
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;
CREATE TABLE IF NOT EXISTS ngo_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  title TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ngo_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION create_donor_impact_row()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO donor_impact (donor_id)
  VALUES (NEW.id)
  ON CONFLICT (donor_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_donor_impact_row ON donors;

CREATE TRIGGER trg_create_donor_impact_row
AFTER INSERT ON donors
FOR EACH ROW
EXECUTE FUNCTION create_donor_impact_row();
CREATE OR REPLACE FUNCTION update_donor_impact(donor_uid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE donor_impact
  SET
    total_donations = (SELECT COUNT(*) FROM donations WHERE donor_id = donor_uid),
    total_value = COALESCE((SELECT SUM(amount) FROM donations WHERE donor_id = donor_uid), 0),
    ngos_helped = (SELECT COUNT(DISTINCT ngo_id) FROM donations WHERE donor_id = donor_uid),
    recent_donation_date = (SELECT MAX(created_at) FROM donations WHERE donor_id = donor_uid),
    avg_donation_value = (
      SELECT AVG(amount) FROM donations WHERE donor_id = donor_uid
    ),
    top_category = (
      SELECT category FROM donations
      WHERE donor_id = donor_uid
      GROUP BY category
      ORDER BY COUNT(*) DESC LIMIT 1
    ),
    progress_percent = LEAST(
       (SELECT COUNT(*) FROM donations WHERE donor_id = donor_uid) * 10,
       100
    ),
    donor_level = CASE
        WHEN (SELECT COUNT(*) FROM donations WHERE donor_id = donor_uid) >= 20 THEN 'Gold'
        WHEN (SELECT COUNT(*) FROM donations WHERE donor_id = donor_uid) >= 10 THEN 'Silver'
        ELSE 'Bronze'
    END,
    updated_at = NOW()
  WHERE donor_id = donor_uid;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_update_donor_impact
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_donor_impact();
-- existing function (example)
-- CREATE FUNCTION update_donor_impact(p_donor_id uuid) RETURNS void ...

-- wrapper trigger function
CREATE OR REPLACE FUNCTION update_donor_impact_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM update_donor_impact(NEW.donor_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_donor_impact ON donations;

CREATE TRIGGER trg_update_donor_impact
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_donor_impact_trigger();
DROP TABLE IF EXISTS donor_impact CASCADE;
CREATE TABLE donor_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  donor_id UUID UNIQUE REFERENCES donors(id) ON DELETE CASCADE,

  total_donations INT DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  ngos_helped INT DEFAULT 0,

  recent_donation_date TIMESTAMP,
  top_category TEXT,
  avg_donation_value NUMERIC DEFAULT 0,

  donor_level TEXT DEFAULT 'Bronze'
    CHECK (donor_level IN ('Bronze','Silver','Gold')),

  progress_percent INT DEFAULT 0
    CHECK (progress_percent BETWEEN 0 AND 100),

  updated_at TIMESTAMP DEFAULT NOW()
);
-- Ensure function exists (this is safe to recreate)
CREATE OR REPLACE FUNCTION create_donor_impact_row()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO donor_impact (donor_id)
  VALUES (NEW.id)
  ON CONFLICT (donor_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE t.tgname = 'trg_create_donor_impact_row'
      AND c.relname = 'donors'
      AND n.nspname = 'public'  -- change if donors is in another schema
  ) THEN
    EXECUTE 'CREATE TRIGGER trg_create_donor_impact_row
             AFTER INSERT ON public.donors
             FOR EACH ROW
             EXECUTE FUNCTION create_donor_impact_row()';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_donor_impact(donor_uid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE donor_impact
  SET
    total_donations = (SELECT COUNT(*) FROM donations WHERE donor_id = donor_uid),
    total_value = COALESCE((SELECT SUM(amount) FROM donations WHERE donor_id = donor_uid), 0),
    ngos_helped = (SELECT COUNT(DISTINCT ngo_id) FROM donations WHERE donor_id = donor_uid),
    recent_donation_date = (SELECT MAX(created_at) FROM donations WHERE donor_id = donor_uid),
    avg_donation_value = (SELECT AVG(amount) FROM donations WHERE donor_id = donor_uid),
    top_category = (
      SELECT category FROM donations
      WHERE donor_id = donor_uid
      GROUP BY category
      ORDER BY COUNT(*) DESC LIMIT 1
    ),
    donor_level = CASE
      WHEN (SELECT COUNT(*) FROM donations WHERE donor_id = donor_uid) >= 20 THEN 'Gold'
      WHEN (SELECT COUNT(*) FROM donations WHERE donor_id = donor_uid) >= 10 THEN 'Silver'
      ELSE 'Bronze'
    END,
    progress_percent = LEAST(
      (SELECT COUNT(*) FROM donations WHERE donor_id = donor_uid) * 10,
      100
    ),
    updated_at = NOW()
  WHERE donor_id = donor_uid;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS ngo_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  quantity INT,
  urgency TEXT CHECK (urgency IN ('low','medium','high')),
  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE ngos
ADD COLUMN IF NOT EXISTS image_path TEXT;

CREATE TABLE IF NOT EXISTS ngo_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_amount NUMERIC,
  raised_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES ngo_campaigns(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_id TEXT,
  order_id TEXT,
  status TEXT DEFAULT 'SUCCESS',
  created_at TIMESTAMP DEFAULT NOW()
);
ALTER TABLE ngo_campaigns
ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE POLICY "NGO can update its own campaigns"
ON ngo_campaigns
FOR UPDATE
USING ( auth.uid() = ngo_id );
CREATE POLICY "Allow all updates temporarily"
ON ngo_campaigns
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);


ALTER TABLE donations
ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS donation_type TEXT
CHECK (donation_type IN ('Pickup', 'Drop-off', 'Either'));

ALTER TABLE donations
ADD COLUMN IF NOT EXISTS pickup_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS pickup_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS pickup_accuracy DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS pickup_map_source TEXT
  CHECK (pickup_map_source IN ('manual', 'gps', 'auto'));


CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);


ALTER TABLE donors
ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

ALTER TABLE donors
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

ALTER TABLE volunteers
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

ALTER TABLE donors ALTER COLUMN password DROP NOT NULL;
ALTER TABLE volunteers ALTER COLUMN password DROP NOT NULL;

-- Allow NGO to upload images
CREATE POLICY "Allow NGO uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'ngo_images');

-- Allow NGO to update/delete own images
CREATE POLICY "Allow NGO deletes"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'ngo_images');

-- Allow public read
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ngo_images');
ALTER TABLE ngos
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

create table volunteer_live_location (
  id uuid default gen_random_uuid() primary key,
  volunteer_id uuid references volunteers(id),
  assignment_id uuid references volunteer_assignments(id),
  latitude double precision,
  longitude double precision,
  accuracy double precision,
  updated_at timestamptz default now()
);
create table assignment_events (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid,
  event text,
  note text,
  created_at timestamptz default now()
);
ALTER TABLE volunteer_assignments
DROP CONSTRAINT IF EXISTS volunteer_assignments_status_check;

ALTER TABLE volunteer_assignments
ADD CONSTRAINT volunteer_assignments_status_check
CHECK (
  status IN ('Assigned','Accepted','In Progress','Delivered','Cancelled')
);
ALTER TABLE donations
DROP CONSTRAINT IF EXISTS donations_status_check;

ALTER TABLE donations
ADD CONSTRAINT donations_status_check
CHECK (
  status IN (
    'Pending',
    'Accepted',
    'Assigned',
    'In Progress',
    'Delivered',
    'Completed',
    'Cancelled'
  )
);
create table public.volunteer_location_logs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references volunteer_assignments(id) on delete cascade,
  volunteer_id uuid references volunteers(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  recorded_at timestamp without time zone default now()
);
alter table volunteer_assignments
add column delivered_latitude double precision,
add column delivered_longitude double precision;
