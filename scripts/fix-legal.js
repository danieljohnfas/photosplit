const fs = require('fs');

// 1. Fix privacy-policy.html
let privacyContent = fs.readFileSync('privacy-policy.html', 'utf8');

const oldAds = `<li>
                <strong>Google AdSense:</strong> We use Google AdSense to serve
                advertisements. Google use cookies to serve ads based on a
                user's prior visits to your website or other websites.
              </li>
              <li>
                <strong>Personalized Advertising:</strong> Google's use of
                advertising cookies enables it and its partners to serve ads to
                users based on their visit to your sites and/or other sites on
                the Internet.
              </li>`;

const newAds = `<li>
                <strong>Amazon Associates & pCloud:</strong> We participate in affiliate advertising programs designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com and pCloud.
              </li>
              <li>
                <strong>Google Analytics & AdSense:</strong> We use Google services to monitor traffic and occasionally serve advertisements. Google uses cookies to serve personalized ads based on prior visits.
              </li>`;

privacyContent = privacyContent.replace(oldAds, newAds);
fs.writeFileSync('privacy-policy.html', privacyContent, 'utf8');

// 2. Fix terms.html
let termsContent = fs.readFileSync('terms.html', 'utf8');

const oldLaw = `These Terms shall be governed and construed in accordance with the laws
              of the jurisdiction in which the Service operates, without regard to its conflict
              of law provisions.`;

const newLaw = `These Terms shall be governed and construed in accordance with the laws
              of the State of Delaware, United States, without regard to its conflict
              of law provisions.`;

termsContent = termsContent.replace(oldLaw, newLaw);
fs.writeFileSync('terms.html', termsContent, 'utf8');

console.log('Fixed legal pages');
