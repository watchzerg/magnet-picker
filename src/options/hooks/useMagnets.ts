import { useState, useEffect } from 'react';
import { MagnetInfo } from '../../types/magnet';
import { getMagnetsFromStorage, sortMagnetsBySize } from '../../utils/magnet';

export const useMagnets = () => {
    const [magnets, setMagnets] = useState<MagnetInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const loadMagnets = async () => {
        try {
            console.log('Loading magnets from storage...');
            const magnetList = await getMagnetsFromStorage();
            if (magnetList.length > 0) {
                console.log('First magnet data format:', JSON.stringify(magnetList[0], null, 2));
            }
            console.log('Loaded magnets:', magnetList);
            const sortedMagnets = sortMagnetsBySize(magnetList);
            setMagnets(sortedMagnets);
        } catch (error) {
            console.error('加载磁力链接失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('useMagnets useEffect running');
        loadMagnets();
        
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.magnets) {
                console.log('Storage changed, reloading magnets...');
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
                console.log('Auto refreshing magnets...');
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