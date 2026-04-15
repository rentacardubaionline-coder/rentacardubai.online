-- Seed reviews for core businesses to demonstrate the UI
insert into public.business_reviews (business_id, reviewer_name, reviewer_avatar_url, rating, comment, created_at) values
-- Karachi Executive Rentals
('550e8400-e29b-41d4-a716-446655440001', 'Ahmed Khan', 'https://i.pravatar.cc/150?u=ahmed', 5, 'Great experience! The Corolla was in perfect condition and the pickup was very smooth.', now() - interval '2 days'),
('550e8400-e29b-41d4-a716-446655440001', 'Sara Malik', 'https://i.pravatar.cc/150?u=sara', 4, 'Very professional service. The car was clean but the delivery was slightly delayed.', now() - interval '5 days'),
('550e8400-e29b-41d4-a716-446655440001', 'Zainab Qureshi', 'https://i.pravatar.cc/150?u=zainab', 5, 'Excellent value for money. Highly recommended for executive travel in Karachi.', now() - interval '10 days'),
('550e8400-e29b-41d4-a716-446655440001', 'Bilal Ahmed', 'https://i.pravatar.cc/150?u=bilal', 4, 'Good fleet of cars. Staff was helpful and friendly throughout the rental period.', now() - interval '15 days'),

-- Premium Car Rentals
('550e8400-e29b-41d4-a716-446655440003', 'Fahad Mustafa', 'https://i.pravatar.cc/150?u=fahad', 5, 'Truly premium experience. The Fortuner was spotless and drove like a dream.', now() - interval '1 day'),
('550e8400-e29b-41d4-a716-446655440003', 'Mehak Ali', 'https://i.pravatar.cc/150?u=mehak', 5, 'Best luxury car rental in Karachi. Very transparent pricing and excellent support.', now() - interval '3 days'),
('550e8400-e29b-41d4-a716-446655440003', 'Omar Sheikh', 'https://i.pravatar.cc/150?u=omar', 4, 'Great selection of high-end cars. Process was quick and straightforward.', now() - interval '7 days'),

-- Luxury Motors
('550e8400-e29b-41d4-a716-446655440005', 'Hamza Ali', 'https://i.pravatar.cc/150?u=hamza', 5, 'The BMW was amazing. Perfect for my wedding anniversary. Top notch service!', now() - interval '4 days'),
('550e8400-e29b-41d4-a716-446655440005', 'Ayesha Khan', 'https://i.pravatar.cc/150?u=ayesha', 5, 'Exceptional quality. The Mercedes was brand new. Will definitely book again.', now() - interval '8 days'),
('550e8400-e29b-41d4-a716-446655440005', 'Daniyal Razzaq', 'https://i.pravatar.cc/150?u=daniyal', 3, 'Service was okay, but the car I originally wanted wasn''t available on short notice.', now() - interval '12 days');
