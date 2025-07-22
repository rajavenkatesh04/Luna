import { useTheme } from 'next-themes';

export default function ToggleSwitch() {
    const { theme, setTheme } = useTheme();

    function handleToggle() {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }

    return (
        <button onClick={handleToggle}>
            {theme === 'dark' ? 'light' : 'dark'} mode
        </button>
    );
}