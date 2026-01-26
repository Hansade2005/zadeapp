import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import { useLanguage } from '../i18n';

const PrivacyPolicy: React.FC = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: January 2026',
      intro: 'At ZadeApp, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.',
      sections: [
        {
          title: '1. Information We Collect',
          content: `We collect information you provide directly to us, such as when you create an account, make a purchase, list a product, apply for a job, or contact us for support. This may include:

• Name and contact information (email, phone, address)
• Account credentials
• Payment information
• Profile information and photos
• Communications with other users
• Job applications and resumes
• Product listings and descriptions`
        },
        {
          title: '2. How We Use Your Information',
          content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Connect buyers with sellers, employers with job seekers
• Send promotional communications (with your consent)
• Respond to your comments, questions, and requests
• Monitor and analyze trends, usage, and activities
• Detect, investigate, and prevent fraudulent transactions`
        },
        {
          title: '3. Information Sharing',
          content: `We may share your information in the following situations:

• With other users as necessary to facilitate transactions
• With service providers who perform services on our behalf
• In response to legal requests or to protect our rights
• In connection with a merger, acquisition, or sale of assets
• With your consent or at your direction`
        },
        {
          title: '4. Data Security',
          content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.'
        },
        {
          title: '5. Your Rights',
          content: `You have the right to:

• Access and receive a copy of your personal data
• Rectify inaccurate personal data
• Request deletion of your personal data
• Object to processing of your personal data
• Data portability
• Withdraw consent at any time`
        },
        {
          title: '6. Contact Us',
          content: 'If you have any questions about this Privacy Policy, please contact us at privacy@zadeapp.ca or through our support channels.'
        }
      ]
    },
    fr: {
      title: 'Politique de Confidentialité',
      lastUpdated: 'Dernière mise à jour: Janvier 2026',
      intro: "Chez ZadeApp, nous prenons votre vie privée au sérieux. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre plateforme.",
      sections: [
        {
          title: '1. Informations que nous collectons',
          content: `Nous collectons les informations que vous nous fournissez directement, telles que lorsque vous créez un compte, effectuez un achat, publiez un produit, postulez à un emploi ou nous contactez pour obtenir de l'aide. Cela peut inclure:

• Nom et coordonnées (courriel, téléphone, adresse)
• Identifiants de compte
• Informations de paiement
• Informations de profil et photos
• Communications avec d'autres utilisateurs
• Candidatures et CV
• Annonces et descriptions de produits`
        },
        {
          title: '2. Comment nous utilisons vos informations',
          content: `Nous utilisons les informations que nous collectons pour:

• Fournir, maintenir et améliorer nos services
• Traiter les transactions et envoyer les informations connexes
• Connecter acheteurs et vendeurs, employeurs et chercheurs d'emploi
• Envoyer des communications promotionnelles (avec votre consentement)
• Répondre à vos commentaires, questions et demandes
• Surveiller et analyser les tendances, l'utilisation et les activités
• Détecter, enquêter et prévenir les transactions frauduleuses`
        },
        {
          title: '3. Partage des informations',
          content: `Nous pouvons partager vos informations dans les situations suivantes:

• Avec d'autres utilisateurs si nécessaire pour faciliter les transactions
• Avec des prestataires de services qui effectuent des services en notre nom
• En réponse à des demandes légales ou pour protéger nos droits
• Dans le cadre d'une fusion, acquisition ou vente d'actifs
• Avec votre consentement ou à votre demande`
        },
        {
          title: '4. Sécurité des données',
          content: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès non autorisé, l'altération, la divulgation ou la destruction. Cependant, aucune méthode de transmission sur Internet n'est sécurisée à 100%."
        },
        {
          title: '5. Vos droits',
          content: `Vous avez le droit de:

• Accéder et recevoir une copie de vos données personnelles
• Rectifier les données personnelles inexactes
• Demander la suppression de vos données personnelles
• Vous opposer au traitement de vos données personnelles
• Portabilité des données
• Retirer votre consentement à tout moment`
        },
        {
          title: '6. Nous contacter',
          content: "Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à privacy@zadeapp.ca ou via nos canaux de support."
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

export default PrivacyPolicy;
