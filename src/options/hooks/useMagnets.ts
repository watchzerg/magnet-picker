import { useState, useEffect } from 'react';
import { MagnetInfo } from '../../types/magnet';
import { getMagnetsFromStorage, sortMagnetsBySize } from '../../utils/magnet';

export const useMagnets = () => {
    const [magnets, setMagnets] = useState<MagnetInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const loadMagnets = async () => {
        try {
            const magnetList = await getMagnetsFromStorage();
            const sortedMagnets = sortMagnetsBySize(magnetList);
            setMagnets(sortedMagnets);
        } catch (error) {
            console.error('加载磁力链接失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMagnets();
        
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.magnets) {
                loadMagnets();
            }
        };

        chrome.storage.onChanged.addListener(handleStorageChange);

        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        if (autoRefresh) {
            timer = setInterval(() => {
                loadMagnets();
            }, 5000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [autoRefresh]);

    return {
        magnets,
        loading,
        autoRefresh,
        setAutoRefresh,
        loadMagnets
    };
}; 