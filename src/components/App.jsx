import { ThemeProvider } from '../contexts/ThemeContext';
import Auth from './Auth';

export default function App() {
  return (
    <ThemeProvider>
      <Auth />
    </ThemeProvider>
  );
}
