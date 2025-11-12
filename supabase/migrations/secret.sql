CREATE OR REPLACE FUNCTION update_donor_impact()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE donor_impact
  SET
    total_donations = (
      SELECT COUNT(*) FROM donations WHERE donor_id = NEW.donor_id
    ),
    total_value = (
      SELECT COALESCE(SUM(amount), 0) FROM donations WHERE donor_id = NEW.donor_id
    ),
    ngos_helped = (
      SELECT COUNT(DISTINCT ngo_id) FROM donations WHERE donor_id = NEW.donor_id
    ),
    recent_donation_date = (
      SELECT MAX(created_at) FROM donations WHERE donor_id = NEW.donor_id
    ),
    top_category = (
      SELECT category FROM donations WHERE donor_id = NEW.donor_id
      GROUP BY category ORDER BY COUNT(*) DESC LIMIT 1
    ),
    avg_donation_value = (
      SELECT AVG(amount) FROM donations WHERE donor_id = NEW.donor_id
    ),
    updated_at = NOW()
  WHERE donor_id = NEW.donor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_donation_change
AFTER INSERT OR UPDATE OR DELETE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_donor_impact();










SELECT
  v.name, v.email, v.city, v.phone, nv.joined_at
FROM ngo_volunteers nv
JOIN volunteers v ON nv.volunteer_id = v.id
WHERE nv.ngo_id = <current_ngo_id>;
