const fs = require('fs');
const code = fs.readFileSync('original/bundle.js', 'utf8');

// Find all React component functions by looking for standard JSX patterns or exported pages
// Let's look for navigation routes and headers
const navLabels = code.match(/label:\"([^\"]+)\"/g);
console.log('Nav labels:', navLabels);

// Find buttons and actions
const buttons = code.match(/>\"([A-Za-z0-9\s—–\.\,\?\!\:\-\+]{3,40})\"</g);
if (buttons) {
  const uniqueButtons = [...new Set(buttons.map(b => b.slice(2, -2)))];
  console.log('Buttons/Text samples (first 30):', uniqueButtons.slice(0, 30));
}

// Find state hooks or context
const contextPattern = /createContext\([^)]*\)/g;
console.log('Contexts:', code.match(contextPattern));

// Let's search for "Decision" or "Intelligence"
const diMatches = code.match(/[a-zA-Z0-9\s]{0,50}(?:Decision|Intelligence)[a-zA-Z0-9\s]{0,50}/gi);
console.log('Decision Intelligence matches:', [...new Set(diMatches)]);
