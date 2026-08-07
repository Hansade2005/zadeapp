export type Language = 'en' | 'fr';

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    submit: string;
    search: string;
    filter: string;
    sort: string;
    all: string;
    none: string;
    yes: string;
    no: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    open: string;
    more: string;
    less: string;
  };

  // Navigation
  nav: {
    home: string;
    marketplace: string;
    jobs: string;
    events: string;
    freelancers: string;
    artistes: string;
    messages: string;
    notifications: string;
    profile: string;
    settings: string;
    signIn: string;
    signUp: string;
    signOut: string;
    cart: string;
    wishlist: string;
  };

  // Home page
  home: {
    heroTitle: string;
    heroSubtitle: string;
    exploreMarketplace: string;
    findJobs: string;
    discoverEvents: string;
    hireFreelancers: string;
    featuredProducts: string;
    latestJobs: string;
    upcomingEvents: string;
    topFreelancers: string;
    viewAll: string;
  };

  // Marketplace
  marketplace: {
    title: string;
    searchPlaceholder: string;
    categories: string;
    priceRange: string;
    condition: string;
    location: string;
    sortBy: string;
    newest: string;
    priceLowHigh: string;
    priceHighLow: string;
    addToCart: string;
    buyNow: string;
    contactSeller: string;
    outOfStock: string;
    inStock: string;
  };

  // Jobs
  jobs: {
    title: string;
    searchPlaceholder: string;
    jobType: string;
    fullTime: string;
    partTime: string;
    contract: string;
    remote: string;
    salaryRange: string;
    applyNow: string;
    saveJob: string;
    postedBy: string;
    deadline: string;
    applications: string;
  };

  // Events
  events: {
    title: string;
    searchPlaceholder: string;
    eventType: string;
    dateRange: string;
    register: string;
    getTickets: string;
    freeEvent: string;
    soldOut: string;
    spotsLeft: string;
    organizedBy: string;
    contactOrganizer: string;
  };

  // Freelancers
  freelancers: {
    title: string;
    searchPlaceholder: string;
    skills: string;
    hourlyRate: string;
    availability: string;
    available: string;
    notAvailable: string;
    hireNow: string;
    viewProfile: string;
    contactFreelancer: string;
  };

  // Artistes
  artistes: {
    title: string;
    searchPlaceholder: string;
    genre: string;
    bookNow: string;
    viewProfile: string;
    contactArtist: string;
  };

  // Cart & Checkout
  cart: {
    title: string;
    empty: string;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    checkout: string;
    continueShopping: string;
    removeItem: string;
    updateQuantity: string;
  };

  // Profile
  profile: {
    title: string;
    editProfile: string;
    myProducts: string;
    myOrders: string;
    myJobs: string;
    myEvents: string;
    myRegistrations: string;
    myApplications: string;
    wallet: string;
    credits: string;
  };

  // Settings
  settings: {
    title: string;
    account: string;
    notifications: string;
    privacy: string;
    language: string;
    theme: string;
    changePassword: string;
    deleteAccount: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };

  // Auth
  auth: {
    signIn: string;
    signUp: string;
    email: string;
    password: string;
    forgotPassword: string;
    rememberMe: string;
    noAccount: string;
    hasAccount: string;
    fullName: string;
    createAccount: string;
  };

  // Footer
  footer: {
    description: string;
    marketplace: string;
    services: string;
    entertainment: string;
    account: string;
    browseProducts: string;
    myProducts: string;
    myOrders: string;
    wishlist: string;
    findJobs: string;
    myJobs: string;
    freelancers: string;
    events: string;
    artists: string;
    myEvents: string;
    artistProfile: string;
    messages: string;
    profile: string;
    settings: string;
    myCredits: string;
    notifications: string;
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
    copyright: string;
    madeWith: string;
    inCanada: string;
    contactUs: string;
    supportEmail: string;
    supportPhone: string;
  };

  // Messages
  messages: {
    title: string;
    inbox: string;
    sent: string;
    compose: string;
    noMessages: string;
    reply: string;
    subject: string;
    message: string;
    send: string;
  };

  // Errors
  errors: {
    required: string;
    invalidEmail: string;
    passwordMismatch: string;
    somethingWrong: string;
    notFound: string;
    unauthorized: string;
    networkError: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      all: 'All',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      open: 'Open',
      more: 'More',
      less: 'Less',
    },
    nav: {
      home: 'Home',
      marketplace: 'Marketplace',
      jobs: 'Jobs',
      events: 'Events',
      freelancers: 'Freelancers',
      artistes: 'Artists',
      messages: 'Messages',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      cart: 'Cart',
      wishlist: 'Wishlist',
    },
    home: {
      heroTitle: 'Your All-in-One Canadian Marketplace',
      heroSubtitle: 'Buy, sell, find jobs, hire freelancers, and discover events - all in one place.',
      exploreMarketplace: 'Explore Marketplace',
      findJobs: 'Find Jobs',
      discoverEvents: 'Discover Events',
      hireFreelancers: 'Hire Freelancers',
      featuredProducts: 'Featured Products',
      latestJobs: 'Latest Jobs',
      upcomingEvents: 'Upcoming Events',
      topFreelancers: 'Top Freelancers',
      viewAll: 'View All',
    },
    marketplace: {
      title: 'Marketplace',
      searchPlaceholder: 'Search products...',
      categories: 'Categories',
      priceRange: 'Price Range',
      condition: 'Condition',
      location: 'Location',
      sortBy: 'Sort By',
      newest: 'Newest',
      priceLowHigh: 'Price: Low to High',
      priceHighLow: 'Price: High to Low',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      contactSeller: 'Contact Seller',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
    },
    jobs: {
      title: 'Jobs',
      searchPlaceholder: 'Search jobs...',
      jobType: 'Job Type',
      fullTime: 'Full Time',
      partTime: 'Part Time',
      contract: 'Contract',
      remote: 'Remote',
      salaryRange: 'Salary Range',
      applyNow: 'Apply Now',
      saveJob: 'Save Job',
      postedBy: 'Posted by',
      deadline: 'Deadline',
      applications: 'Applications',
    },
    events: {
      title: 'Events',
      searchPlaceholder: 'Search events...',
      eventType: 'Event Type',
      dateRange: 'Date Range',
      register: 'Register',
      getTickets: 'Get Tickets',
      freeEvent: 'Free Event',
      soldOut: 'Sold Out',
      spotsLeft: 'spots left',
      organizedBy: 'Organized by',
      contactOrganizer: 'Contact Organizer',
    },
    freelancers: {
      title: 'Freelancers',
      searchPlaceholder: 'Search freelancers...',
      skills: 'Skills',
      hourlyRate: 'Hourly Rate',
      availability: 'Availability',
      available: 'Available',
      notAvailable: 'Not Available',
      hireNow: 'Hire Now',
      viewProfile: 'View Profile',
      contactFreelancer: 'Contact Freelancer',
    },
    artistes: {
      title: 'Artists',
      searchPlaceholder: 'Search artists...',
      genre: 'Genre',
      bookNow: 'Book Now',
      viewProfile: 'View Profile',
      contactArtist: 'Contact Artist',
    },
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      total: 'Total',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
      removeItem: 'Remove',
      updateQuantity: 'Update Quantity',
    },
    profile: {
      title: 'Profile',
      editProfile: 'Edit Profile',
      myProducts: 'My Products',
      myOrders: 'My Orders',
      myJobs: 'My Jobs',
      myEvents: 'My Events',
      myRegistrations: 'My Registrations',
      myApplications: 'My Applications',
      wallet: 'Wallet',
      credits: 'Credits',
    },
    settings: {
      title: 'Settings',
      account: 'Account',
      notifications: 'Notifications',
      privacy: 'Privacy',
      language: 'Language',
      theme: 'Theme',
      changePassword: 'Change Password',
      deleteAccount: 'Delete Account',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      fullName: 'Full Name',
      createAccount: 'Create Account',
    },
    footer: {
      description: "Canada's premier multi-marketplace platform connecting buyers, sellers, job seekers, freelancers, and event organizers across the country.",
      marketplace: 'Marketplace',
      services: 'Services',
      entertainment: 'Entertainment',
      account: 'Account',
      browseProducts: 'Browse Products',
      myProducts: 'My Products',
      myOrders: 'My Orders',
      wishlist: 'Wishlist',
      findJobs: 'Find Jobs',
      myJobs: 'My Jobs',
      freelancers: 'Freelancers',
      events: 'Events',
      artists: 'Artists',
      myEvents: 'My Events',
      artistProfile: 'Artist Profile',
      messages: 'Messages',
      profile: 'Profile',
      settings: 'Settings',
      myCredits: 'My Credits',
      notifications: 'Notifications',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      cookiePolicy: 'Cookie Policy',
      copyright: '© 2026 ZadeApp. All rights reserved.',
      madeWith: 'Made with',
      inCanada: 'in Canada',
      contactUs: 'Contact Us',
      supportEmail: 'support@zadeapp.ca',
      supportPhone: '+1 (437) 907-0414',
    },
    messages: {
      title: 'Messages',
      inbox: 'Inbox',
      sent: 'Sent',
      compose: 'Compose',
      noMessages: 'No messages yet',
      reply: 'Reply',
      subject: 'Subject',
      message: 'Message',
      send: 'Send',
    },
    errors: {
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      passwordMismatch: 'Passwords do not match',
      somethingWrong: 'Something went wrong',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      networkError: 'Network error',
    },
  },
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      submit: 'Soumettre',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      all: 'Tout',
      none: 'Aucun',
      yes: 'Oui',
      no: 'Non',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      close: 'Fermer',
      open: 'Ouvrir',
      more: 'Plus',
      less: 'Moins',
    },
    nav: {
      home: 'Accueil',
      marketplace: 'Marché',
      jobs: 'Emplois',
      events: 'Événements',
      freelancers: 'Pigistes',
      artistes: 'Artistes',
      messages: 'Messages',
      notifications: 'Notifications',
      profile: 'Profil',
      settings: 'Paramètres',
      signIn: 'Connexion',
      signUp: 'Inscription',
      signOut: 'Déconnexion',
      cart: 'Panier',
      wishlist: 'Favoris',
    },
    home: {
      heroTitle: 'Votre Marché Canadien Tout-en-Un',
      heroSubtitle: 'Achetez, vendez, trouvez un emploi, engagez des pigistes et découvrez des événements - tout au même endroit.',
      exploreMarketplace: 'Explorer le Marché',
      findJobs: 'Trouver un Emploi',
      discoverEvents: 'Découvrir les Événements',
      hireFreelancers: 'Engager des Pigistes',
      featuredProducts: 'Produits en Vedette',
      latestJobs: 'Derniers Emplois',
      upcomingEvents: 'Événements à Venir',
      topFreelancers: 'Meilleurs Pigistes',
      viewAll: 'Voir Tout',
    },
    marketplace: {
      title: 'Marché',
      searchPlaceholder: 'Rechercher des produits...',
      categories: 'Catégories',
      priceRange: 'Gamme de Prix',
      condition: 'État',
      location: 'Emplacement',
      sortBy: 'Trier Par',
      newest: 'Plus Récent',
      priceLowHigh: 'Prix: Croissant',
      priceHighLow: 'Prix: Décroissant',
      addToCart: 'Ajouter au Panier',
      buyNow: 'Acheter Maintenant',
      contactSeller: 'Contacter le Vendeur',
      outOfStock: 'Rupture de Stock',
      inStock: 'En Stock',
    },
    jobs: {
      title: 'Emplois',
      searchPlaceholder: 'Rechercher des emplois...',
      jobType: "Type d'Emploi",
      fullTime: 'Temps Plein',
      partTime: 'Temps Partiel',
      contract: 'Contrat',
      remote: 'Télétravail',
      salaryRange: 'Échelle Salariale',
      applyNow: 'Postuler Maintenant',
      saveJob: 'Sauvegarder',
      postedBy: 'Publié par',
      deadline: 'Date Limite',
      applications: 'Candidatures',
    },
    events: {
      title: 'Événements',
      searchPlaceholder: 'Rechercher des événements...',
      eventType: "Type d'Événement",
      dateRange: 'Période',
      register: "S'inscrire",
      getTickets: 'Obtenir des Billets',
      freeEvent: 'Événement Gratuit',
      soldOut: 'Complet',
      spotsLeft: 'places restantes',
      organizedBy: 'Organisé par',
      contactOrganizer: "Contacter l'Organisateur",
    },
    freelancers: {
      title: 'Pigistes',
      searchPlaceholder: 'Rechercher des pigistes...',
      skills: 'Compétences',
      hourlyRate: 'Taux Horaire',
      availability: 'Disponibilité',
      available: 'Disponible',
      notAvailable: 'Non Disponible',
      hireNow: 'Engager Maintenant',
      viewProfile: 'Voir le Profil',
      contactFreelancer: 'Contacter le Pigiste',
    },
    artistes: {
      title: 'Artistes',
      searchPlaceholder: 'Rechercher des artistes...',
      genre: 'Genre',
      bookNow: 'Réserver Maintenant',
      viewProfile: 'Voir le Profil',
      contactArtist: "Contacter l'Artiste",
    },
    cart: {
      title: 'Panier',
      empty: 'Votre panier est vide',
      subtotal: 'Sous-total',
      shipping: 'Livraison',
      tax: 'Taxes',
      total: 'Total',
      checkout: 'Payer',
      continueShopping: 'Continuer vos Achats',
      removeItem: 'Retirer',
      updateQuantity: 'Modifier la Quantité',
    },
    profile: {
      title: 'Profil',
      editProfile: 'Modifier le Profil',
      myProducts: 'Mes Produits',
      myOrders: 'Mes Commandes',
      myJobs: 'Mes Emplois',
      myEvents: 'Mes Événements',
      myRegistrations: 'Mes Inscriptions',
      myApplications: 'Mes Candidatures',
      wallet: 'Portefeuille',
      credits: 'Crédits',
    },
    settings: {
      title: 'Paramètres',
      account: 'Compte',
      notifications: 'Notifications',
      privacy: 'Confidentialité',
      language: 'Langue',
      theme: 'Thème',
      changePassword: 'Changer le Mot de Passe',
      deleteAccount: 'Supprimer le Compte',
      currentPassword: 'Mot de Passe Actuel',
      newPassword: 'Nouveau Mot de Passe',
      confirmPassword: 'Confirmer le Mot de Passe',
    },
    auth: {
      signIn: 'Connexion',
      signUp: 'Inscription',
      email: 'Courriel',
      password: 'Mot de Passe',
      forgotPassword: 'Mot de Passe Oublié?',
      rememberMe: 'Se Souvenir de Moi',
      noAccount: "Vous n'avez pas de compte?",
      hasAccount: 'Vous avez déjà un compte?',
      fullName: 'Nom Complet',
      createAccount: 'Créer un Compte',
    },
    footer: {
      description: "La première plateforme multimarché du Canada reliant acheteurs, vendeurs, chercheurs d'emploi, pigistes et organisateurs d'événements à travers le pays.",
      marketplace: 'Marché',
      services: 'Services',
      entertainment: 'Divertissement',
      account: 'Compte',
      browseProducts: 'Parcourir les Produits',
      myProducts: 'Mes Produits',
      myOrders: 'Mes Commandes',
      wishlist: 'Favoris',
      findJobs: 'Trouver un Emploi',
      myJobs: 'Mes Emplois',
      freelancers: 'Pigistes',
      events: 'Événements',
      artists: 'Artistes',
      myEvents: 'Mes Événements',
      artistProfile: "Profil d'Artiste",
      messages: 'Messages',
      profile: 'Profil',
      settings: 'Paramètres',
      myCredits: 'Mes Crédits',
      notifications: 'Notifications',
      privacyPolicy: 'Politique de Confidentialité',
      termsOfService: "Conditions d'Utilisation",
      cookiePolicy: 'Politique de Cookies',
      copyright: '© 2026 ZadeApp. Tous droits réservés.',
      madeWith: 'Fait avec',
      inCanada: 'au Canada',
      contactUs: 'Contactez-nous',
      supportEmail: 'support@zadeapp.ca',
      supportPhone: '+1 (437) 907-0414',
    },
    messages: {
      title: 'Messages',
      inbox: 'Boîte de Réception',
      sent: 'Envoyés',
      compose: 'Composer',
      noMessages: 'Aucun message',
      reply: 'Répondre',
      subject: 'Sujet',
      message: 'Message',
      send: 'Envoyer',
    },
    errors: {
      required: 'Ce champ est obligatoire',
      invalidEmail: 'Adresse courriel invalide',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      somethingWrong: "Une erreur s'est produite",
      notFound: 'Non trouvé',
      unauthorized: 'Non autorisé',
      networkError: 'Erreur de réseau',
    },
  },
};
