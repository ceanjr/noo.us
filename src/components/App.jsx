import { ThemeProvider } from '../contexts/ThemeContext';
import Auth from './AuthRefactored';

export default function App() {
  return (
    <ThemeProvider>
      <Auth />
    </ThemeProvider>
  );
}
