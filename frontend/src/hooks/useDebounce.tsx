import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
    // State to store the debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set a timer to update the debounced value after the specified delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function: cancel the timeout if the value changes before the delay
        // This is the core of debouncing
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]); // Only re-run the effect if value or delay changes

    return debouncedValue;
}

export default useDebounce;