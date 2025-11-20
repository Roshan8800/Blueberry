
import React from 'react';
import { AppView } from '../types';

interface StaticPageProps {
  type: AppView;
}

const StaticPage: React.FC<StaticPageProps> = ({ type }) => {
  const getContent = () => {
    switch (type) {
      case AppView.TERMS:
        return {
          title: "Terms of Service",
          icon: "fa-file-contract",
          text: `Effective Date: January 1, 2025

1. Acceptance of Terms
By accessing and using PlayNite (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.

2. Age Restriction
You must be at least 18 years of age (or the age of majority in your jurisdiction) to access this Service. This website contains age-restricted materials. If you are under the age of 18, you are not permitted to access this website for any reason.

3. Content Ownership
All content provided on this Service is for entertainment purposes only. The owners of PlayNite do not claim ownership of third-party content embedded from external sources, but retain rights to the platform design, logo, and original productions.

4. User Conduct
You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Service in any way that could damage the Service, the services, or the general business of PlayNite.

5. Modifications
PlayNite reserves the right to change these conditions from time to time as it sees fit and your continued use of the site will signify your acceptance of any adjustment to these terms.`
        };
      case AppView.PRIVACY:
        return {
          title: "Privacy Policy",
          icon: "fa-shield-halved",
          text: `Last Updated: January 1, 2025

1. Data Collection
We collect minimal data necessary to provide our services, including IP addresses for regional compliance and basic usage statistics to improve user experience. We do not sell your personal data to third parties.

2. Cookies
We use cookies to store your preferences (such as volume settings and age verification status). You can control the use of cookies at the individual browser level.

3. Third-Party Services
Our website may contain links to other websites. Please note that we have no control of websites outside the PlayNite domain. If you provide information to a website to which we link, we are not responsible for its protection and privacy.

4. Security
We take reasonable precautions to protect your information. When you submit sensitive information via the website, your information is protected both online and offline.`
        };
      case AppView.PARENTAL:
        return {
          title: "Parental Controls",
          icon: "fa-child-reaching",
          text: `PlayNite is an adult-only website. We strictly prohibit access to anyone under the age of 18.

To protect minors from accessing this site, we recommend the following parental control software and filtering services:
- Net Nanny (www.netnanny.com)
- CyberSitter (www.cybersitter.com)
- Norton Family (family.norton.com)

If you are a parent and believe your child has accessed this site, please contact us immediately so we can ban the associated IP address.`
        };
      case AppView.EXEMPTION:
        return {
          title: "2257 Exemption",
          icon: "fa-scale-balanced",
          text: `Compliance Statement - 18 U.S.C. § 2257

PlayNite is a secondary producer and/or host of content. All models, actors, actresses, and other persons appearing in any visual depiction of actual sexually explicit conduct appearing on or otherwise contained in this website were over the age of eighteen (18) years at the time of the creation of such depictions.

Records required for all content produced by PlayNite are kept by the Custodian of Records at our primary place of business.`
        };
      case AppView.DMCA:
        return {
          title: "DMCA / Content Removal",
          icon: "fa-copyright",
          text: `Digital Millennium Copyright Act Notification Guidelines

It is our policy to respond to clear notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act. In addition, we will promptly terminate without notice the accounts of those determined by us to be "repeat infringers."

If you are a copyright owner or an agent thereof, and you believe that any content hosted on our website infringes your copyrights, then you may submit a notification with our Designated Copyright Agent.`
        };
      default:
        return { title: "Page Not Found", icon: "fa-circle-question", text: "The requested page does not exist." };
    }
  };

  const content = getContent();

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-dark-card border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
          <div className="w-16 h-16 rounded-full bg-brand-900/30 flex items-center justify-center text-brand-500">
            <i className={`fa-solid ${content.icon} text-3xl`}></i>
          </div>
          <h1 className="text-3xl font-bold text-white">{content.title}</h1>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
            {content.text}
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 flex justify-center text-gray-500 text-sm">
          &copy; 2025 PlayNite Inc. All legal rights reserved.
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
