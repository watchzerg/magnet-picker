export const extractHashFromMagnet = (magnetUrl: string): string => {
    const match = magnetUrl.match(/btih:([a-fA-F0-9]{40})/);
    return match ? match[1].toUpperCase() : '';
}; 