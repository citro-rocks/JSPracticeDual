
let sitsArray = [];
let x, y;
let currentGroup = null;
let groupsEnabled = true; // Flag to control whether groups can still be created
let groups = [];
let selectedRow = null;  // To store the first row selected by the group

function init() {
    const sitsNumber = getSits();
    x = sitsNumber[0];
    y = sitsNumber[1];

    createSits(x, y);
}

init();

function getSits() {
    const searchParams = new URLSearchParams(window.location.search);
    let x = Number(searchParams.get('m')); // row
    let y = Number(searchParams.get('n')); // col

    return [x, y];
}

function createSits(x, y) {
    for (let i = 1; i < x + 1; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = 'row-' + i;
        document.getElementById('seatsContainer').appendChild(row);

        for (let j = 1; j < y + 1; j++) {
            const sit = createSit(i, j);
            sitsArray.push(sit);

            const sitElement = document.createElement('div');
            sitElement.className = 'sit';
            sitElement.id = i + '-' + j;
            const sitElementPosition = document.createElement('div');
            sitElementPosition.innerText = i + '-' + j;
            sitElement.appendChild(sitElementPosition);
            const sitElementPrice = document.createElement('div');
            sitElementPrice.innerText = sit.price;
            sitElement.appendChild(sitElementPrice);
            sitElement.addEventListener('click', selectSit);
            row.appendChild(sitElement);
        }
    }
}

function createSit(row, col) {
    const sit = {
        row: row,
        col: col,
        price: getSeatPrice(row),
        group: undefined,  // Track group that has reserved this seat
        reserved: false,   // True if seat is reserved
        selected: false,   // True if seat is selected by the group
        available: true,   // True if seat is available
        tampone: false     // True if seat is part of a tampone zone
    };
    return sit;
}

/*
function selectSit(event) {
    event.stopPropagation();

    if (currentGroup === null) {
        alert('No group is currently selecting seats!');
        return;
    }

    const sitId = event.currentTarget.id;
    const selectedSit = event.currentTarget;
    const [row, col] = sitId.split('-');
    const sit = sitsArray.find(sit => sit.row == row && sit.col == col);

    // If the seat is reserved by another group or part of the tampone zone, prevent selection
    if (sit.reserved && sit.group !== currentGroup.id) {
        alert('This seat is reserved by another group!');
        return;
    }

    // Mark the first selected seat's row for the group
    if (!selectedRow) {
        selectedRow = sit.row;
        applyRowOpacity(); // Apply opacity to all other rows
    }

    // Ensure selection is within the same row and continuous if it's not an undo move
    if (sit.row !== selectedRow) {
        alert('You can only select seats from the same row!');
        return;
    }

    // Handle deselection (undo) case: If the seat was previously selected, remove it
    if (sit.selected) {
        // Check if deselecting the seat would break continuity
        const remainingSelectedSeats = currentGroup.selectedSeats.filter(s => s !== sit);

        // Check if the remaining seats are continuous
        if (!isSelectionContinuous(remainingSelectedSeats)) {
            alert('Deselecting this seat would break the continuity of the group selection!');
            return; // Prevent deselection if it breaks continuity
        }

        // Proceed with deselection
        sit.selected = false;
        selectedSit.classList.remove('selected');
        selectedSit.style.backgroundColor = '';  // Remove the background color
        sit.group = undefined;
        sit.reserved = false;

        currentGroup.selectedSeats = remainingSelectedSeats;

        // If there are no more selected seats in the row, reset the row opacity and allow other rows to be selected
        if (currentGroup.selectedSeats.filter(s => s.row === sit.row).length === 0) {
            selectedRow = null;  // Allow for row change
            applyRowOpacity();   // Update row opacity to 1 for all rows
        }

        updateStatistics();
        return; // Exit early to allow undo without checking for gaps
    }

    // If it's the first selection or after a deselection (valid undo), check continuity
    if (currentGroup.selectedSeats.length > 0) {
        const lastSelectedSit = currentGroup.selectedSeats[currentGroup.selectedSeats.length - 1];
        const lastSitId = `${lastSelectedSit.row}-${lastSelectedSit.col}`;
        const lastSitElement = document.getElementById(lastSitId);
        const lastSitCol = lastSelectedSit.col;

        // If selecting a non-adjacent seat after a deselection, show a warning
        if (Math.abs(lastSitCol - sit.col) !== 1) {
            alert('Seats must be selected continuously with no gaps!');
            return;
        }
    }

    // If no issues, mark the seat as selected
    sit.selected = true;
    selectedSit.classList.add('selected');
    selectedSit.style.backgroundColor = currentGroup.color;  // Apply group color
    sit.group = currentGroup.id;
    sit.reserved = true;

    currentGroup.selectedSeats.push(sit);

    updateStatistics();
    applyRowOpacity(); // Reapply row opacity after selection
}

// Check if the selected seats are continuous (no gaps)
function isSelectionContinuous(selectedSeats) {
    if (selectedSeats.length < 2) {
        return true;  // A single seat is always considered continuous
    }

    // Sort the selected seats by column to check continuity
    selectedSeats.sort((a, b) => a.col - b.col);

    for (let i = 0; i < selectedSeats.length - 1; i++) {
        const current = selectedSeats[i];
        const next = selectedSeats[i + 1];
        if (next.col !== current.col + 1) {
            return false;  // If the columns are not adjacent, it's not continuous
        }
    }

    return true;
}

function applyRowOpacity() {

    const rows = document.getElementsByClassName('row');
    // Check if any seat is selected in the row
    for (let row of rows) {
        row.style.opacity = 1;  // Reset opacity to 1 for all rows by default
    }
    // Check if any seat is selected in the row
    for (let row of rows) {
        const rowId = parseInt(row.id.split('-')[1]);
        const isSelectedInRow = currentGroup.selectedSeats.some(s => s.row === rowId); // Check if any seat is selected in this row

        // If no seat is selected in the row, reset opacity for this row and set others to 0.6
        if (isSelectedInRow) {
            row.style.opacity = 1; // Keep the selected row with opacity 1
        } else {
            row.style.opacity = 0.6; // Set other rows to opacity 0.6
        }
    }

    // If no rows are selected, reset opacity for all rows to 1 (allowing all rows to be selected)
    if (currentGroup.selectedSeats.length === 0) {
        for (let row of rows) {
            row.style.opacity = 1; // Reset all rows' opacity to 1
        }
    }
}



function finishGroupSelection() {

    // document.getElementById('startButton').style.display = 'inline';
    // document.getElementById('finishButton').style.display = 'none';
    // document.getElementById('noMoreGroupsButton').style.display = 'inline';
    document.getElementById('startButton').disabled = false;
    document.getElementById('finishButton').disabled = true;
    document.getElementById('noMoreGroupsButton').disabled = false;

    alert(`Group ${currentGroup.id} has finished selection.`);

    // Apply the tampone zone around selected seats after finishing
    currentGroup.selectedSeats.forEach(sit => applyTamponeZone(sit));

    // Reset the current group and row state
    currentGroup = null;
    selectedRow = null;
    // Reset all rows opacity to 1 after finishing selection
    applyRowOpacity();
    updateGroupInfo();
}


function startNewGroup() {
    if (!groupsEnabled) {
        alert('No more groups can be created!');
        return;
    }

    const groupId = prompt('Enter a new group ID:');
    if (groupId === null || groupId.trim() === '') {
        alert('Group ID is required!');
        return;
    }

    const groupColor = getRandomColor(); // Assign a unique color for the group
    currentGroup = {
        id: groupId,
        selectedSeats: [],
        color: groupColor
    };
    groups.push(currentGroup);

    alert(`Group ${groupId} is now selecting seats!`);
    updateGroupInfo();

    // Enable/Disable buttons based on the current state
    // document.getElementById('startButton').style.display = 'none'; // Hide the button in the HTML
    // document.getElementById('finishButton').style.display = 'inline'; // Show the button in the HTML
    // document.getElementById('noMoreGroupsButton').style.display = 'none';
    document.getElementById('startButton').disabled = true;
    document.getElementById('finishButton').disabled = false;
    document.getElementById('noMoreGroupsButton').disabled = true;




}
function applyTamponeZone(sit) {
    const row = sit.row;
    const col = sit.col;

    // Check for adjacent seats to mark as tampone (buffer zone)
    const adjacentSeats = [
        { row: row - 1, col: col }, // Seat above
        { row: row + 1, col: col }, // Seat below
        { row: row, col: col - 1 }, // Seat left
        { row: row, col: col + 1 },  // Seat right

        { row: row - 1, col: col - 1 }, // gore levo
        { row: row - 1, col: col + 1 }, // gore desno
        { row: row + 1, col: col - 1 }, // dolje levo
        { row: row + 1, col: col + 1 } // dolje desno
    ];

    adjacentSeats.forEach(({ row, col }) => {
        if (row > 0 && row <= x && col > 0 && col <= y) {
            const adjacentSit = sitsArray.find(s => s.row === row && s.col === col);
            if (adjacentSit && !adjacentSit.selected && !adjacentSit.reserved) {
                const sitElement = document.getElementById(`${row}-${col}`);
                sitElement.classList.add('tampone');  // Add tampone class for the buffer zone
                adjacentSit.tampone = true;  // Mark it as part of the tampone zone

                // Mark this tampone seat as reserved for the next group
                adjacentSit.reserved = true;
            }
        }
    });
}

function getSeatPrice(row) {
    const totalRows = x;
    const midRow = Math.floor(x / 2);

    if (row === 1 || row === totalRows) {
        return 300;
    }

    const proportion = (500 - 300) / (midRow - 1);
    if (row <= midRow) {
        return Math.round(300 + proportion * (row - 1));
    } else {
        return Math.round(500 - proportion * (row - midRow - 1));
    }
}


function updateGroupInfo() {
    if (currentGroup) {
        document.getElementById('groupInfo').innerText = `Group ${currentGroup.id} is selecting seats.`;
    } else {
        document.getElementById('groupInfo').innerText = `No group is currently selecting seats.`;
    }
}

function updateStatistics() {
    const selectedSeatsCount = currentGroup.selectedSeats.length;
    const unselectedSeatsCount = sitsArray.length - selectedSeatsCount;
    const totalRevenue = currentGroup.selectedSeats.reduce((acc, sit) => acc + sit.price, 0);

    document.getElementById('totalSeats').innerText = sitsArray.length;
    document.getElementById('selectedSeats').innerText = selectedSeatsCount;
    document.getElementById('unselectedSeats').innerText = unselectedSeatsCount;
    document.getElementById('totalRevenue').innerText = totalRevenue;

    updateGroupStatistics();
}

function updateGroupStatistics() {
    const tbody = document.querySelector('#groupStatistics tbody');
    tbody.innerHTML = ''; // Clear current data

    groups.forEach(group => {
        const row = document.createElement('tr');
        const groupName = document.createElement('td');
        groupName.innerText = group.id;
        const selectedSeats = document.createElement('td');
        selectedSeats.innerText = group.selectedSeats.length;
        const revenue = document.createElement('td');
        revenue.innerText = group.selectedSeats.reduce((acc, sit) => acc + sit.price, 0);
        row.appendChild(groupName);
        row.appendChild(selectedSeats);
        row.appendChild(revenue);
        tbody.appendChild(row);
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function noMoreGroups() {
    groupsEnabled = false;
    // document.getElementById('startButton').style.display = 'none';
    // document.getElementById('finishButton').style.display = 'none';
    // document.getElementById('noMoreGroupsButton').style.display = 'none';
    document.getElementById('startButton').disabled = true;
    document.getElementById('finishButton').disabled = true;
    document.getElementById('noMoreGroupsButton').disabled = true;

    // Grab all remaining unselected seats
    grabRemainingSeats();

    alert('No more groups can be created! All remaining seats are now grabbed.');
}
function grabRemainingSeats() {
    sitsArray.forEach(sit => {
        if (!sit.selected && !sit.reserved) {
            // Mark this seat as grabbed
            sit.reserved = true;
            const sitElement = document.getElementById(`${sit.row}-${sit.col}`);
            sitElement.style.backgroundColor = 'gray';  // Change the color to indicate grabbed seat
            sitElement.classList.add('reserved');  // Optionally, you can add a "reserved" class for styling
        }
    });

    // Optionally, update statistics or display a message that all seats are grabbed
    updateStatistics();
}

*/

/*
function createRow(seatsPerRow) {
    // Get the container element
    const seatsContainer = document.getElementById('seatsContainer');
  
    // Create a new row element
    const row = document.createElement('div');
    row.classList.add('row', 'firstrow'); // Add a class for styling
  
    // Create the specified number of seats in the row
    for (let i = 0; i < seatsPerRow; i++) {
      const seat = document.createElement('div');
      seat.classList.add('seat'); // Add a class for styling
      seat.height = 200
      seat.width = 200
      row.appendChild(seat);
    }
  
    // Append the row to the container
    seatsContainer.appendChild(row);
  }

  createRow(10)

*/