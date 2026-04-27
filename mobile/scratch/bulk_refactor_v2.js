const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;

      // 1. Fix Imports
      if (content.includes("'expo-router'")) {
          // Replace useRouter and useFocusEffect imports from expo-router to @react-navigation/native
          content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]expo-router['"]/g, (match, imports) => {
              const parts = imports.split(',').map(i => i.trim());
              const newImports = parts.map(p => {
                  if (p === 'useRouter') return 'useNavigation';
                  if (p === 'useLocalSearchParams') return 'useRoute';
                  return p;
              });
              return `import { ${newImports.join(', ')} } from '@react-navigation/native'`;
          });
          changed = true;
      }

      // 2. Fix variable initializations
      if (content.includes('const router = useRouter()')) {
          content = content.replace(/const router = useRouter\(\)/g, 'const navigation = useNavigation<any>()');
          changed = true;
      }
      
      // 3. Fix router. calls to navigation. calls
      if (content.includes('router.')) {
          content = content.replace(/router\./g, 'navigation.');
          changed = true;
      }

      // 4. Fix useLocalSearchParams to useRoute().params
      if (content.includes('useLocalSearchParams()')) {
          content = content.replace(/const\s+params\s+=\s+useLocalSearchParams\(\)/g, 'const route = useRoute<any>(); const params = route.params || {}');
          content = content.replace(/const\s+\{([^}]+)\}\s+=\s+useLocalSearchParams\(\)/g, (match, vars) => {
              return `const route = useRoute<any>(); const { ${vars} } = route.params || {}`;
          });
          changed = true;
      }

      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Refactored ${filePath}`);
      }
    }
  });
}

walk(path.join(process.cwd(), 'app'));
