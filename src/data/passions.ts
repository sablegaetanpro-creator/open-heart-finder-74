export const PASSIONS = [
  // Activités sportives
  'Football', 'Basketball', 'Tennis', 'Natation', 'Course à pied', 'Yoga', 'Fitness',
  'Escalade', 'Vélo', 'Randonnée', 'Ski', 'Snowboard', 'Surf', 'Plongée', 'Boxe',
  'Arts martiaux', 'Danse', 'Pilates', 'CrossFit', 'Golf', 'Badminton', 'Volley-ball',
  
  // Arts et culture
  'Musique', 'Cinéma', 'Théâtre', 'Art', 'Photographie', 'Peinture', 'Dessin',
  'Sculpture', 'Littérature', 'Poésie', 'Histoire', 'Archéologie', 'Museums',
  'Expositions', 'Concerts', 'Festivals', 'Opéra', 'Ballet', 'Jazz', 'Rock',
  'Classique', 'Électro', 'Hip-hop', 'Folk', 'Blues', 'Reggae', 'Country',
  
  // Voyages et découverte
  'Voyages', 'Randonnée', 'Camping', 'Backpacking', 'Road trips', 'Croisières',
  'Plages', 'Montagnes', 'Forêts', 'Déserts', 'Villes', 'Villages', 'Pays étrangers',
  'Cultures', 'Langues', 'Cuisine locale', 'Street food', 'Restaurants gastronomiques',
  
  // Cuisine et gastronomie
  'Cuisine', 'Pâtisserie', 'Vin', 'Café', 'Thé', 'Cocktails', 'Bière artisanale',
  'Fromages', 'Chocolat', 'Cuisine du monde', 'Végétarien', 'Vegan', 'Bio',
  'Fait maison', 'Barbecue', 'Sushi', 'Pizza', 'Pasta', 'Curry', 'Tacos',
  
  // Technologie et innovation
  'Technologie', 'Programmation', 'Intelligence artificielle', 'Robotique',
  'Réalité virtuelle', 'Jeux vidéo', 'Cryptomonnaies', 'Blockchain', 'Startups',
  'Innovation', 'Science', 'Espace', 'Astronomie', 'Physique', 'Chimie',
  
  // Nature et environnement
  'Nature', 'Jardinage', 'Plantes', 'Fleurs', 'Animaux', 'Chiens', 'Chats',
  'Oiseaux', 'Poissons', 'Écologie', 'Développement durable', 'Recyclage',
  'Énergies renouvelables', 'Agriculture bio', 'Apiculture', 'Forêt',
  
  // Mode et beauté
  'Mode', 'Stylisme', 'Cosmétiques', 'Maquillage', 'Coiffure', 'Manucure',
  'Tatouages', 'Piercings', 'Bijoux', 'Accessoires', 'Sneakers', 'Luxe',
  'Design', 'Architecture', 'Décoration', 'DIY', 'Création',
  
  // Social et communautaire
  'Bénévolat', 'Associations', 'Humanitaire', 'Éducation', 'Mentorat',
  'Réseaux sociaux', 'Événements', 'Meetups', 'Conférences', 'Séminaires',
  'Formation', 'Développement personnel', 'Méditation', 'Mindfulness',
  
  // Jeux et divertissement
  'Jeux de société', 'Échecs', 'Poker', 'Bridge', 'Scrabble', 'Trivial Pursuit',
  'Jeux de rôle', 'Escape games', 'Puzzles', 'Légos', 'Collection', 'Trading cards',
  'Jeux de stratégie', 'Jeux de mots', 'Charades', 'Karaoké',
  
  // Automobile et mécanique
  'Voitures', 'Motos', 'Véhicules électriques', 'Mécanique', 'Tuning',
  'Courses', 'Rally', 'Formule 1', 'Voitures anciennes', 'Restoration',
  'Moteurs', 'Technologie automobile', 'Écoconduite',
  
  // Médias et communication
  'Podcasts', 'Blogs', 'Vlogging', 'Streaming', 'YouTube', 'TikTok',
  'Instagram', 'Photographie', 'Vidéographie', 'Montage vidéo', 'Animation',
  'Graphisme', 'Web design', 'Marketing digital', 'Réseaux sociaux',
  
  // Santé et bien-être
  'Méditation', 'Yoga', 'Tai Chi', 'Qi Gong', 'Acupuncture', 'Naturopathie',
  'Homéopathie', 'Aromathérapie', 'Massage', 'Spa', 'Thermalisme',
  'Nutrition', 'Sport santé', 'Bien-être', 'Développement personnel',
  
  // Métiers et passions professionnelles
  'Entrepreneuriat', 'Business', 'Finance', 'Investissement', 'Trading',
  'Immobilier', 'Marketing', 'Communication', 'Publicité', 'Design',
  'Architecture', 'Ingénierie', 'Médecine', 'Droit', 'Enseignement',
  'Recherche', 'Consulting', 'Freelance', 'Télétravail',
  
  // Traditions et spiritualité
  'Spiritualité', 'Religion', 'Philosophie', 'Mythologie', 'Astrologie',
  'Tarot', 'Numerologie', 'Feng Shui', 'Bouddhisme', 'Zen', 'Sagesse',
  'Traditions', 'Cultures anciennes', 'Archéologie', 'Histoire',
  
  // Aventure et extrême
  'Parachutisme', 'Base jump', 'Wingsuit', 'Parapente', 'Deltaplane',
  'Alpinisme', 'Spéléologie', 'Plongée extrême', 'Surf extrême',
  'Motocross', 'Rally raid', 'Aventure', 'Exploration', 'Défis',
  
  // Relaxation et loisirs
  'Lecture', 'Écriture', 'Journaling', 'Coloriage', 'Tricot', 'Crochet',
  'Couture', 'Bricolage', 'Jardinage zen', 'Aquariophilie', 'Terrariums',
  'Collection', 'Philatélie', 'Numismatique', 'Antiquités',
  
  // Famille et relations
  'Famille', 'Enfants', 'Parentalité', 'Éducation', 'Relations',
  'Amis', 'Communauté', 'Solidarité', 'Partage', 'Transmission',
  'Mentorat', 'Coaching', 'Thérapie', 'Développement relationnel'
] as const;

export type Passion = typeof PASSIONS[number];

export const PASSION_CATEGORIES = {
  'Sport & Fitness': ['Football', 'Basketball', 'Tennis', 'Natation', 'Course à pied', 'Yoga', 'Fitness', 'Escalade', 'Vélo', 'Randonnée', 'Ski', 'Snowboard', 'Surf', 'Plongée', 'Boxe', 'Arts martiaux', 'Danse', 'Pilates', 'CrossFit', 'Golf', 'Badminton', 'Volley-ball'],
  'Arts & Culture': ['Musique', 'Cinéma', 'Théâtre', 'Art', 'Photographie', 'Peinture', 'Dessin', 'Sculpture', 'Littérature', 'Poésie', 'Histoire', 'Archéologie', 'Museums', 'Expositions', 'Concerts', 'Festivals', 'Opéra', 'Ballet', 'Jazz', 'Rock', 'Classique', 'Électro', 'Hip-hop', 'Folk', 'Blues', 'Reggae', 'Country'],
  'Voyages & Découverte': ['Voyages', 'Randonnée', 'Camping', 'Backpacking', 'Road trips', 'Croisières', 'Plages', 'Montagnes', 'Forêts', 'Déserts', 'Villes', 'Villages', 'Pays étrangers', 'Cultures', 'Langues', 'Cuisine locale', 'Street food', 'Restaurants gastronomiques'],
  'Cuisine & Gastronomie': ['Cuisine', 'Pâtisserie', 'Vin', 'Café', 'Thé', 'Cocktails', 'Bière artisanale', 'Fromages', 'Chocolat', 'Cuisine du monde', 'Végétarien', 'Vegan', 'Bio', 'Fait maison', 'Barbecue', 'Sushi', 'Pizza', 'Pasta', 'Curry', 'Tacos'],
  'Technologie & Innovation': ['Technologie', 'Programmation', 'Intelligence artificielle', 'Robotique', 'Réalité virtuelle', 'Jeux vidéo', 'Cryptomonnaies', 'Blockchain', 'Startups', 'Innovation', 'Science', 'Espace', 'Astronomie', 'Physique', 'Chimie'],
  'Nature & Environnement': ['Nature', 'Jardinage', 'Plantes', 'Fleurs', 'Animaux', 'Chiens', 'Chats', 'Oiseaux', 'Poissons', 'Écologie', 'Développement durable', 'Recyclage', 'Énergies renouvelables', 'Agriculture bio', 'Apiculture', 'Forêt'],
  'Mode & Beauté': ['Mode', 'Stylisme', 'Cosmétiques', 'Maquillage', 'Coiffure', 'Manucure', 'Tatouages', 'Piercings', 'Bijoux', 'Accessoires', 'Sneakers', 'Luxe', 'Design', 'Architecture', 'Décoration', 'DIY', 'Création'],
  'Social & Communautaire': ['Bénévolat', 'Associations', 'Humanitaire', 'Éducation', 'Mentorat', 'Réseaux sociaux', 'Événements', 'Meetups', 'Conférences', 'Séminaires', 'Formation', 'Développement personnel', 'Méditation', 'Mindfulness'],
  'Jeux & Divertissement': ['Jeux de société', 'Échecs', 'Poker', 'Bridge', 'Scrabble', 'Trivial Pursuit', 'Jeux de rôle', 'Escape games', 'Puzzles', 'Légos', 'Collection', 'Trading cards', 'Jeux de stratégie', 'Jeux de mots', 'Charades', 'Karaoké'],
  'Automobile & Mécanique': ['Voitures', 'Motos', 'Véhicules électriques', 'Mécanique', 'Tuning', 'Courses', 'Rally', 'Formule 1', 'Voitures anciennes', 'Restoration', 'Moteurs', 'Technologie automobile', 'Écoconduite'],
  'Médias & Communication': ['Podcasts', 'Blogs', 'Vlogging', 'Streaming', 'YouTube', 'TikTok', 'Instagram', 'Photographie', 'Vidéographie', 'Montage vidéo', 'Animation', 'Graphisme', 'Web design', 'Marketing digital', 'Réseaux sociaux'],
  'Santé & Bien-être': ['Méditation', 'Yoga', 'Tai Chi', 'Qi Gong', 'Acupuncture', 'Naturopathie', 'Homéopathie', 'Aromathérapie', 'Massage', 'Spa', 'Thermalisme', 'Nutrition', 'Sport santé', 'Bien-être', 'Développement personnel'],
  'Métiers & Professionnel': ['Entrepreneuriat', 'Business', 'Finance', 'Investissement', 'Trading', 'Immobilier', 'Marketing', 'Communication', 'Publicité', 'Design', 'Architecture', 'Ingénierie', 'Médecine', 'Droit', 'Enseignement', 'Recherche', 'Consulting', 'Freelance', 'Télétravail'],
  'Traditions & Spiritualité': ['Spiritualité', 'Religion', 'Philosophie', 'Mythologie', 'Astrologie', 'Tarot', 'Numerologie', 'Feng Shui', 'Bouddhisme', 'Zen', 'Sagesse', 'Traditions', 'Cultures anciennes', 'Archéologie', 'Histoire'],
  'Aventure & Extrême': ['Parachutisme', 'Base jump', 'Wingsuit', 'Parapente', 'Deltaplane', 'Alpinisme', 'Spéléologie', 'Plongée extrême', 'Surf extrême', 'Motocross', 'Rally raid', 'Aventure', 'Exploration', 'Défis'],
  'Relaxation & Loisirs': ['Lecture', 'Écriture', 'Journaling', 'Coloriage', 'Tricot', 'Crochet', 'Couture', 'Bricolage', 'Jardinage zen', 'Aquariophilie', 'Terrariums', 'Collection', 'Philatélie', 'Numismatique', 'Antiquités'],
  'Famille & Relations': ['Famille', 'Enfants', 'Parentalité', 'Éducation', 'Relations', 'Amis', 'Communauté', 'Solidarité', 'Partage', 'Transmission', 'Mentorat', 'Coaching', 'Thérapie', 'Développement relationnel']
} as const;

export const getRandomPassions = (count: number = 10): string[] => {
  const shuffled = [...PASSIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const searchPassions = (query: string): string[] => {
  const lowercaseQuery = query.toLowerCase();
  return PASSIONS.filter(passion => 
    passion.toLowerCase().includes(lowercaseQuery)
  );
};