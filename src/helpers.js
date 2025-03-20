export const getPermissions = () => {
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
            // First get ahold of the legacy getUserMedia, if present
            const getUserMedia =
                navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if (!getUserMedia) {
                return Promise.reject(
                    new Error("getUserMedia is not implemented in this browser")
                );
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise((resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        };
    }
    navigator.mediaDevices.getUserMedia =
        navigator.mediaDevices.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

    return new Promise((resolve, reject) => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then(stream => {
                resolve(stream);
            })
            .catch(err => {
                reject(err);
                //   throw new Error(`Unable to fetch stream ${err}`);
            });
    });
};

// Add the shortenTimeString function
//20:05:01
export const shortenTimeString = (time) => {
    // Log type and value for debugging
    // console.log('Type of time:', typeof time);
    // console.log('Value of time:', time);
    
    if (!time || typeof time !== 'string') {
        return '';
    }
    // Split the time string into parts
    const parts = time.split(':');

    if (parts.length === 3) {
        const [hours, minutes, seconds] = parts;

        // If hours are 0, return minutes and seconds only
        if (parseInt(hours, 10) === 0) {
            return `${parseInt(minutes, 10)}:${seconds}`;
        }

        // Otherwise, return the full time with hours
        return `${parseInt(hours, 10)}:${minutes}:${seconds}`;
    }

    // If the input isn't valid, return it unchanged
    return time;
};

// 2025-02-09T20:44:01.000000Z
export const formatDateTime = (input) => {
    // Parse the input string into a Date object
    const date = new Date(input);

    // Extract hours, minutes, and seconds
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    // Create the short and full formats
    const short = `${hours}:${minutes}`;
    const full = `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;

    // Return the object
    return { short, full };
}

export const formatDateTimePassed = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.round((now - date) / 1000);
    
    // Helper to calculate calendar day difference
    const getDayDiff = (d1, d2) => {
        const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
        const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
        return Math.floor((utc2 - utc1) / (1000 * 3600 * 24));
    };

    const dayDiff = getDayDiff(date, now);

    if (dayDiff === 0) { // Today
        if (diffSeconds < 60) return 'now';
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m`;
        return `${Math.round(diffMinutes / 60)}h`;
    }

    if (dayDiff === 1) return 'Yesterday';
    if (dayDiff <= 3) return `${dayDiff}d ago`;

    // For older dates, show short format
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: dayDiff > 365 ? 'numeric' : undefined
    }).format(date);
}