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
