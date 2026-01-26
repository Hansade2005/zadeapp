import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { useLanguage } from '../i18n';

const CookiePolicy: React.FC = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Cookie Policy',
      lastUpdated: 'Last updated: January 2026',
      intro: 'This Cookie Policy explains how ZadeApp uses cookies and similar technologies to recognize you when you visit our platform.',
      sections: [
        {
          title: '1. What Are Cookies?',
          content: 'Cookies are small data files placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the site owners.'
        },
        {
          title: '2. Types of Cookies We Use',
          content: `We use the following types of cookies:

Essential Cookies
These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies.

Performance Cookies
These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our services.

Functionality Cookies
These cookies enable enhanced functionality and personalization, such as remembering your preferences (language, region) and providing enhanced features.

Targeting/Advertising Cookies
These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant ads on other sites.`
        },
        {
          title: '3. Cookies We Use',
          content: `Specific cookies on our platform:

• zade_language - Stores your language preference (Essential)
• zade_admin_session - Admin authentication (Essential)
• cart - Shopping cart contents stored locally (Essential)
• settings_[user_id] - User preferences (Functionality)
• supabase-auth-token - Authentication token (Essential)`
        },
        {
          title: '4. Third-Party Cookies',
          content: `We may use third-party services that set their own cookies:

• Supabase - Authentication and database services
• Payment processors - For secure transactions
• Analytics services - To understand usage patterns

These third parties have their own privacy policies governing their use of cookies.`
        },
        {
          title: '5. How to Control Cookies',
          content: `You can control and manage cookies in several ways:

Browser Settings
Most browsers allow you to refuse or accept cookies, delete cookies, and be notified when a cookie is set. Check your browser's help documentation for instructions.

Our Platform Settings
You can manage certain cookie preferences through our Settings page.

Opt-Out Links
For advertising cookies, you can opt out through:
• Digital Advertising Alliance: www.aboutads.info/choices
• Network Advertising Initiative: www.networkadvertising.org/choices

Note: Blocking all cookies may impact your experience on our platform.`
        },
        {
          title: '6. Local Storage',
          content: 'In addition to cookies, we use local storage to store certain information on your device. Local storage is similar to cookies but can store more data. This includes your shopping cart contents and user preferences.'
        },
        {
          title: '7. Updates to This Policy',
          content: 'We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. Any changes will be posted on this page with an updated revision date.'
        },
        {
          title: '8. Contact Us',
          content: 'If you have questions about our use of cookies, please contact us at privacy@zadeapp.ca.'
        }
      ]
    },
    fr: {
      title: 'Politique de Cookies',
      lastUpdated: 'Dernière mise à jour: Janvier 2026',
      intro: "Cette politique de cookies explique comment ZadeApp utilise les cookies et technologies similaires pour vous reconnaître lorsque vous visitez notre plateforme.",
      sections: [
        {
          title: '1. Que sont les cookies?',
          content: "Les cookies sont de petits fichiers de données placés sur votre appareil lorsque vous visitez un site web. Ils sont largement utilisés pour faire fonctionner les sites web plus efficacement et fournir des informations aux propriétaires du site."
        },
        {
          title: '2. Types de cookies que nous utilisons',
          content: `Nous utilisons les types de cookies suivants:

Cookies essentiels
Ces cookies sont nécessaires au bon fonctionnement du site web. Ils permettent des fonctionnalités de base telles que la sécurité, la gestion du réseau et l'accès au compte. Vous ne pouvez pas désactiver ces cookies.

Cookies de performance
Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web en collectant et en rapportant des informations de manière anonyme. Cela nous aide à améliorer nos services.

Cookies de fonctionnalité
Ces cookies permettent des fonctionnalités améliorées et la personnalisation, comme mémoriser vos préférences (langue, région) et fournir des fonctionnalités améliorées.

Cookies de ciblage/publicité
Ces cookies peuvent être définis via notre site par nos partenaires publicitaires pour créer un profil de vos intérêts et vous montrer des publicités pertinentes sur d'autres sites.`
        },
        {
          title: '3. Cookies que nous utilisons',
          content: `Cookies spécifiques sur notre plateforme:

• zade_language - Stocke votre préférence de langue (Essentiel)
• zade_admin_session - Authentification administrateur (Essentiel)
• cart - Contenu du panier stocké localement (Essentiel)
• settings_[user_id] - Préférences utilisateur (Fonctionnalité)
• supabase-auth-token - Jeton d'authentification (Essentiel)`
        },
        {
          title: '4. Cookies tiers',
          content: `Nous pouvons utiliser des services tiers qui définissent leurs propres cookies:

• Supabase - Services d'authentification et de base de données
• Processeurs de paiement - Pour des transactions sécurisées
• Services d'analyse - Pour comprendre les modèles d'utilisation

Ces tiers ont leurs propres politiques de confidentialité régissant leur utilisation des cookies.`
        },
        {
          title: '5. Comment contrôler les cookies',
          content: `Vous pouvez contrôler et gérer les cookies de plusieurs façons:

Paramètres du navigateur
La plupart des navigateurs vous permettent de refuser ou d'accepter les cookies, de supprimer les cookies et d'être notifié lorsqu'un cookie est défini. Consultez la documentation d'aide de votre navigateur pour les instructions.

Paramètres de notre plateforme
Vous pouvez gérer certaines préférences de cookies via notre page Paramètres.

Liens de désinscription
Pour les cookies publicitaires, vous pouvez vous désinscrire via:
• Digital Advertising Alliance: www.aboutads.info/choices
• Network Advertising Initiative: www.networkadvertising.org/choices

Note: Le blocage de tous les cookies peut affecter votre expérience sur notre plateforme.`
        },
        {
          title: '6. Stockage local',
          content: "En plus des cookies, nous utilisons le stockage local pour stocker certaines informations sur votre appareil. Le stockage local est similaire aux cookies mais peut stocker plus de données. Cela inclut le contenu de votre panier et vos préférences utilisateur."
        },
        {
          title: '7. Mises à jour de cette politique',
          content: "Nous pouvons mettre à jour cette politique de cookies de temps en temps pour refléter les changements de technologie, de législation ou de nos pratiques de données. Tout changement sera publié sur cette page avec une date de révision mise à jour."
        },
        {
          title: '8. Nous contacter',
          content: "Si vous avez des questions sur notre utilisation des cookies, veuillez nous contacter à privacy@zadeapp.ca."
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

export default CookiePolicy;
