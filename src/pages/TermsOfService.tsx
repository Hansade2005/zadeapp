import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { useLanguage } from '../i18n';

const TermsOfService: React.FC = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: January 2026',
      intro: 'Welcome to ZadeApp. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.',
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: 'By creating an account or using ZadeApp, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.'
        },
        {
          title: '2. Eligibility',
          content: `To use ZadeApp, you must:

• Be at least 18 years of age
• Be a resident of Canada or have legal authorization to conduct business in Canada
• Provide accurate and complete registration information
• Maintain the security of your account credentials`
        },
        {
          title: '3. User Accounts',
          content: `You are responsible for:

• Maintaining the confidentiality of your account
• All activities that occur under your account
• Notifying us immediately of any unauthorized use
• Ensuring your account information is accurate and up-to-date`
        },
        {
          title: '4. Marketplace Rules',
          content: `When using our marketplace, you agree to:

• List only items you have the right to sell
• Provide accurate descriptions and images
• Honor all completed transactions
• Not engage in fraudulent or deceptive practices
• Comply with all applicable laws and regulations
• Not sell prohibited items (illegal goods, counterfeit products, etc.)`
        },
        {
          title: '5. Jobs & Freelance Services',
          content: `When posting or applying for jobs:

• Employers must provide accurate job descriptions
• Job seekers must provide truthful information
• All employment arrangements must comply with Canadian labor laws
• ZadeApp is not a party to employment agreements between users`
        },
        {
          title: '6. Events',
          content: `Event organizers must:

• Provide accurate event information
• Honor ticket purchases and registrations
• Comply with local regulations and obtain necessary permits
• Be responsible for event safety and management`
        },
        {
          title: '7. Fees and Payments',
          content: `• ZadeApp charges a 10% commission on marketplace sales
• Sellers receive payment after successful delivery confirmation
• Refunds are subject to our refund policy
• All prices are in Canadian dollars unless otherwise specified`
        },
        {
          title: '8. Prohibited Conduct',
          content: `You may not:

• Violate any laws or regulations
• Infringe on intellectual property rights
• Harass, abuse, or harm other users
• Post false, misleading, or deceptive content
• Attempt to circumvent our fee structure
• Use automated systems to access our platform
• Interfere with the proper functioning of our services`
        },
        {
          title: '9. Limitation of Liability',
          content: 'ZadeApp provides the platform "as is" and is not responsible for the quality, safety, or legality of items listed, the accuracy of listings, or the ability of users to complete transactions. We are not liable for any indirect, incidental, or consequential damages.'
        },
        {
          title: '10. Termination',
          content: 'We reserve the right to suspend or terminate accounts that violate these terms. You may also close your account at any time through your account settings.'
        },
        {
          title: '11. Changes to Terms',
          content: 'We may update these terms from time to time. Continued use of ZadeApp after changes constitutes acceptance of the new terms.'
        },
        {
          title: '12. Contact',
          content: 'For questions about these Terms of Service, contact us at legal@zadeapp.ca.'
        }
      ]
    },
    fr: {
      title: "Conditions d'Utilisation",
      lastUpdated: 'Dernière mise à jour: Janvier 2026',
      intro: "Bienvenue sur ZadeApp. En accédant ou en utilisant notre plateforme, vous acceptez d'être lié par ces conditions d'utilisation. Veuillez les lire attentivement.",
      sections: [
        {
          title: "1. Acceptation des conditions",
          content: "En créant un compte ou en utilisant ZadeApp, vous acceptez ces conditions d'utilisation et notre politique de confidentialité. Si vous n'êtes pas d'accord, veuillez ne pas utiliser nos services."
        },
        {
          title: '2. Admissibilité',
          content: `Pour utiliser ZadeApp, vous devez:

• Avoir au moins 18 ans
• Être résident du Canada ou avoir l'autorisation légale de faire des affaires au Canada
• Fournir des informations d'inscription exactes et complètes
• Maintenir la sécurité de vos identifiants de compte`
        },
        {
          title: '3. Comptes utilisateurs',
          content: `Vous êtes responsable de:

• Maintenir la confidentialité de votre compte
• Toutes les activités qui se produisent sous votre compte
• Nous notifier immédiatement de toute utilisation non autorisée
• Vous assurer que les informations de votre compte sont exactes et à jour`
        },
        {
          title: '4. Règles du marché',
          content: `En utilisant notre marché, vous acceptez de:

• Ne lister que des articles que vous avez le droit de vendre
• Fournir des descriptions et des images exactes
• Honorer toutes les transactions complétées
• Ne pas vous engager dans des pratiques frauduleuses ou trompeuses
• Respecter toutes les lois et réglementations applicables
• Ne pas vendre d'articles interdits (produits illégaux, contrefaçons, etc.)`
        },
        {
          title: '5. Emplois et services de pigistes',
          content: `Lors de la publication ou de la candidature à des emplois:

• Les employeurs doivent fournir des descriptions de poste exactes
• Les chercheurs d'emploi doivent fournir des informations véridiques
• Tous les arrangements d'emploi doivent être conformes aux lois du travail canadiennes
• ZadeApp n'est pas partie aux accords d'emploi entre utilisateurs`
        },
        {
          title: '6. Événements',
          content: `Les organisateurs d'événements doivent:

• Fournir des informations exactes sur l'événement
• Honorer les achats de billets et les inscriptions
• Se conformer aux réglementations locales et obtenir les permis nécessaires
• Être responsables de la sécurité et de la gestion de l'événement`
        },
        {
          title: '7. Frais et paiements',
          content: `• ZadeApp facture une commission de 10% sur les ventes du marché
• Les vendeurs reçoivent le paiement après confirmation de livraison réussie
• Les remboursements sont soumis à notre politique de remboursement
• Tous les prix sont en dollars canadiens sauf indication contraire`
        },
        {
          title: '8. Conduite interdite',
          content: `Vous ne pouvez pas:

• Violer des lois ou réglementations
• Porter atteinte aux droits de propriété intellectuelle
• Harceler, abuser ou nuire à d'autres utilisateurs
• Publier du contenu faux, trompeur ou mensonger
• Tenter de contourner notre structure de frais
• Utiliser des systèmes automatisés pour accéder à notre plateforme
• Interférer avec le bon fonctionnement de nos services`
        },
        {
          title: '9. Limitation de responsabilité',
          content: "ZadeApp fournit la plateforme \"telle quelle\" et n'est pas responsable de la qualité, de la sécurité ou de la légalité des articles listés, de l'exactitude des annonces, ou de la capacité des utilisateurs à effectuer des transactions. Nous ne sommes pas responsables des dommages indirects, accessoires ou consécutifs."
        },
        {
          title: '10. Résiliation',
          content: "Nous nous réservons le droit de suspendre ou de résilier les comptes qui violent ces conditions. Vous pouvez également fermer votre compte à tout moment via les paramètres de votre compte."
        },
        {
          title: '11. Modifications des conditions',
          content: "Nous pouvons mettre à jour ces conditions de temps en temps. L'utilisation continue de ZadeApp après les modifications constitue l'acceptation des nouvelles conditions."
        },
        {
          title: '12. Contact',
          content: "Pour toute question concernant ces conditions d'utilisation, contactez-nous à legal@zadeapp.ca."
        }
      ]
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Home' : 'Retour à l\'accueil'}
          </Link>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-sm text-gray-500 mb-6">{t.lastUpdated}</p>

            <p className="text-gray-700 mb-8 leading-relaxed">{t.intro}</p>

            <div className="space-y-8">
              {t.sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default TermsOfService;
