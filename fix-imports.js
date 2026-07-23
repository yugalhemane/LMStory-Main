const fs = require('fs');
const glob = require('glob');

const files = glob.sync('apps/backend/src/modules/**/*.routes.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // There are two forms:
  // import { requireTenantAdmin } from '../middleware/requireTenantAdmin';
  // import { requireTenantAdmin } from '../../user/middleware/requireTenantAdmin';
  // import { requireTenantAdmin } from '../../../shared/middlewares/requireTenantAdmin';
  
  if (content.includes('requireTenantAdmin')) {
    // Replace the import line
    content = content.replace(/import\s+{\s+requireTenantAdmin\s+}\s+from\s+['"].*requireTenantAdmin['"];/, 
      "import { requireTenantAdmin } from '../../../shared/middlewares/requireRole';");
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
