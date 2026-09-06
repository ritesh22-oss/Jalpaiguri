const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newImports = `import { TransportView } from './components/transport/TransportView';
import { CourierSectionView } from './components/courier/CourierView';
import { EducationView } from './components/education/EducationView';`;

if (!code.includes('TransportView')) {
  code = code.replace("import { GovernmentServicesView } from './components/views/GovernmentServicesView';", "import { GovernmentServicesView } from './components/views/GovernmentServicesView';\n" + newImports);
}

const newCases = `      case 'transport':
        return <TransportView />;
      case 'courier':
        return <CourierSectionView />;
      case 'education':
        return <EducationView />;`;

if (!code.includes("case 'transport':")) {
  code = code.replace("      case 'government':", newCases + "\n      case 'government':");
}

fs.writeFileSync('src/App.tsx', code);
