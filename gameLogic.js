// Generate valid Tambola ticket numbers
function generateTicketNumbers() {
    const ticket = Array(3).fill(null).map(() => Array(9).fill(null));
    
    // Define column ranges
    const columnRanges = [
        [1, 10], [11, 20], [21, 30], [31, 40], [41, 50],
        [51, 60], [61, 70], [71, 80], [81, 90]
    ];
    
    // Generate numbers for each row (5 numbers per row)
    for (let row = 0; row < 3; row++) {
        const selectedColumns = [];
        while (selectedColumns.length < 5) {
            const col = Math.floor(Math.random() * 9);
            if (!selectedColumns.includes(col)) {
                selectedColumns.push(col);
            }
        }
        
        // Fill selected columns with valid numbers
        selectedColumns.forEach(col => {
            const [min, max] = columnRanges[col];
            
            // Check if column already has numbers
            const existingNumbers = [];
            for (let r = 0; r < 3; r++) {
                if (ticket[r][col] !== null) {
                    existingNumbers.push(ticket[r][col]);
                }
            }
            
            // Find available numbers in this column range
            const availableNumbers = [];
            for (let num = min; num <= max; num++) {
                if (!existingNumbers.includes(num)) {
                    availableNumbers.push(num);
                }
            }
            
            // Select a random available number
            if (availableNumbers.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableNumbers.length);
                ticket[row][col] = availableNumbers[randomIndex];
            }
        });
    }
    
    // Convert 2D array to 1D array (27 elements) for frontend
    const flatTicket = [];
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 9; col++) {
            flatTicket.push(ticket[row][col] || 0); // Use 0 for empty cells
        }
    }
    
    return flatTicket;
}

// Check winning patterns in Tambola
function checkWinningPatterns(ticket, markedNumbers) {
    const result = {
        earlyFive: false,
        topLine: false,
        middleLine: false,
        bottomLine: false,
        fullHouse: false,
        fourCorners: false
    };
    
    // Convert 1D array to 2D array for easier processing
    const ticket2D = [];
    for (let row = 0; row < 3; row++) {
        ticket2D[row] = [];
        for (let col = 0; col < 9; col++) {
            const index = row * 9 + col;
            ticket2D[row][col] = ticket[index] !== 0 ? ticket[index] : null;
        }
    }
    
    // Count matched numbers on the ticket
    let matchedCount = 0;
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 9; col++) {
            if (ticket2D[row][col] !== null && markedNumbers.includes(ticket2D[row][col])) {
                matchedCount++;
            }
        }
    }
    
    // Early Five: First 5 matched numbers
    if (matchedCount >= 5) {
        result.earlyFive = true;
    }
    
    // Check each row for complete lines
    for (let row = 0; row < 3; row++) {
        let rowMatchedCount = 0;
        let rowTotalNumbers = 0;
        
        for (let col = 0; col < 9; col++) {
            if (ticket2D[row][col] !== null) {
                rowTotalNumbers++;
                if (markedNumbers.includes(ticket2D[row][col])) {
                    rowMatchedCount++;
                }
            }
        }
        
        // Check if all numbers in this row are matched
        if (rowMatchedCount === rowTotalNumbers && rowTotalNumbers > 0) {
            if (row === 0) result.topLine = true;
            if (row === 1) result.middleLine = true;
            if (row === 2) result.bottomLine = true;
        }
    }
    
    // Full House: All 15 numbers matched
    if (matchedCount === 15) {
        result.fullHouse = true;
    }
    
    // Four Corners: Check corner positions
    const cornerPositions = [
        [0, 0], [0, 8], [2, 0], [2, 8]
    ];
    
    let cornersMatched = 0;
    let cornersWithNumbers = 0;
    
    cornerPositions.forEach(([row, col]) => {
        if (ticket2D[row][col] !== null) {
            cornersWithNumbers++;
            if (markedNumbers.includes(ticket2D[row][col])) {
                cornersMatched++;
            }
        }
    });
    
    // Four Corners: All corner numbers (if any exist) are matched
    if (cornersWithNumbers > 0 && cornersMatched === cornersWithNumbers) {
        result.fourCorners = true;
    }
    
    return result;
}

// Generate random player name
function generatePlayerName() {
    const adjectives = ['Happy', 'Lucky', 'Smart', 'Quick', 'Bright', 'Clever', 'Wise', 'Sharp'];
    const nouns = ['Player', 'Gamer', 'Winner', 'Champion', 'Star', 'Hero', 'Master', 'Pro'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    return `${adj}${noun}${number}`;
}

module.exports = {
    generateTicketNumbers,
    checkWinningPatterns,
    generatePlayerName
}; 