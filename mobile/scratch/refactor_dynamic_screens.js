const fs = require('fs');
const path = require('path');

const filesToRefactor = [
  'app/invoice/[id].tsx',
  'app/track/[id].tsx',
  'app/track-route/[id].tsx',
  'app/weigh/[id].tsx',
];

filesToRefactor.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace imports
    content = content.replace(/import \{ useRouter, useLocalSearchParams \} from 'expo-router';/g, "import { useNavigation, useRoute } from '@react-navigation/native';");
    content = content.replace(/import \{ useLocalSearchParams, useRouter \} from 'expo-router';/g, "import { useNavigation, useRoute } from '@react-navigation/native';");
    
    // Replace hooks
    content = content.replace(/const router = useRouter\(\);/g, "const navigation = useNavigation<any>();");
    content = content.replace(/const \{ id \} = useLocalSearchParams\(\);/g, "const route = useRoute<any>(); const id = route.params?.id;");
    
    // Replace router calls
    content = content.replace(/router\.push\(/g, "navigation.navigate(");
    content = content.replace(/router\.replace\(/g, "navigation.replace(");
    content = content.replace(/router\.back\(\)/g, "navigation.goBack()");
    
    fs.writeFileSync(filePath, content);
    console.log(`Refactored ${file}`);
  }
});
