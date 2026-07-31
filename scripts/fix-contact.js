const fs = require('fs');

let content = fs.readFileSync('contact.html', 'utf8');

// Fix email
content = content.replace('simplelogin-newsletter.gains011@simplelogin.com', 'privacy@photosplit.com');

// Add Subject dropdown
const emailInput = `<input
          class="form-control mb-12"
          id="fb-email"
          placeholder="your@email.com"
          required=""
          type="email"
          style="margin-bottom: 12px"
        />`;

const subjectDropdown = `
        <select
          class="form-control mb-12"
          id="fb-subject"
          required=""
          style="margin-bottom: 12px; appearance: auto;"
        >
          <option value="" disabled selected>Select Subject...</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
          <option value="inquiry">General Inquiry</option>
        </select>`;

content = content.replace(emailInput, emailInput + subjectDropdown);

fs.writeFileSync('contact.html', content, 'utf8');
console.log('Fixed contact.html');
