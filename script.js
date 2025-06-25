document.addEventListener('DOMContentLoaded', () => {
    const newOptionInput = document.getElementById('newOptionInput');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const optionsList = document.getElementById('optionsList');
    const spinBtn = document.getElementById('spinBtn');
    const resetBtn = document.getElementById('resetBtn');
    const chosenFoodDisplay = document.getElementById('chosenFoodDisplay');
    const rouletteWheel = document.getElementById('rouletteWheel');

    // Define a set of colors for the segments (can be more or less)
    const segmentColors = [
        '#f44336', // Red
        '#2196f3', // Blue
        '#4caf50', // Green
        '#ffeb3b', // Yellow
        '#9c27b0', // Purple
        '#00bcd4', // Cyan
        '#ff9800', // Orange
        '#795548', // Brown
        '#e91e63', // Pink
        '#607d8b', // Blue Grey
        '#ffc107', // Amber
        '#8bc34a'  // Light Green
    ];

    // Load options from Local Storage or use default ones
    let foodOptions = JSON.parse(localStorage.getItem('dinnerOptions')) || [
        "Pasta",
        "Pasta salad",
        "Omelette & sautéed veggies",
        "Dosa",
        "Chickpea Salad",
        "Fried rice",
        "Cholle",
        "Egg bhurje"
    ];

    // Function to save options to Local Storage
    const saveOptions = () => {
        localStorage.setItem('dinnerOptions', JSON.stringify(foodOptions));
    };

    // Function to render the list of options AND the roulette segments
    const renderOptions = () => {
        optionsList.innerHTML = ''; // Clear existing list
        rouletteWheel.querySelectorAll('.segment-text').forEach(el => el.remove()); // Remove old text elements

        if (foodOptions.length === 0) {
            optionsList.innerHTML = '<li style="text-align: center; color: #888;">No options added yet. Add some!</li>';
            rouletteWheel.style.background = 'none'; // Clear conic gradient
            chosenFoodDisplay.textContent = 'Click \'Spin\' to find out!';
            updateSpinButtonState();
            updateResetButtonState();
            return;
        }

        const numSegments = foodOptions.length;
        const segmentAngle = 360 / numSegments;
        let conicGradientString = 'conic-gradient(';

        // Render options list and prepare for roulette segments
        foodOptions.forEach((option, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${option}</span>
                <button class="remove-btn" data-index="${index}">x</button>
            `;
            optionsList.appendChild(li);

            // Calculate conic gradient stops
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const color = segmentColors[index % segmentColors.length]; // Cycle through colors
            conicGradientString += `${color} ${startAngle}deg ${endAngle}deg${index < numSegments - 1 ? ',' : ''}`;

            // Create and position text labels for the wheel
            const textDiv = document.createElement('div');
            textDiv.classList.add('segment-text');
            textDiv.textContent = option;

            // Check background color luminance to set text color
            // This is a simplified check, full RGB to HSL conversion would be more accurate
            const isLightColor = (color) => {
                // A very basic check: does it look like a light color?
                const hex = color.startsWith('#') ? color.slice(1) : color;
                const r = parseInt(hex.substring(0,2), 16);
                const g = parseInt(hex.substring(2,4), 16);
                const b = parseInt(hex.substring(4,6), 16);
                // Simple luminance calculation
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                return luminance > 0.6; // Threshold can be adjusted
            };

            if (isLightColor(color)) {
                textDiv.classList.add('light-bg');
            }


            // Calculate rotation for the text
            // Rotate the text container to align with the segment
            // Then rotate the text itself back to be upright
            const textRotation = (index * segmentAngle) + (segmentAngle / 2); // Center of segment
            textDiv.style.transform = `rotate(${textRotation}deg) translate(-50%, 0)`; // rotate then translate relative to new axis
            textDiv.style.setProperty('--text-rotation', `rotate(-${textRotation}deg)`); // for inner text rotation if needed, not used directly here

            rouletteWheel.appendChild(textDiv);
        });

        conicGradientString += ')';
        rouletteWheel.style.background = conicGradientString;
        
        // Always add the arrow and center pin back if they were removed (they shouldn't be by segment-text query)
        if (!rouletteWheel.querySelector('.arrow')) {
             const arrow = document.createElement('div');
             arrow.classList.add('arrow');
             rouletteWheel.appendChild(arrow);
        }
        if (!rouletteWheel.querySelector('.center-pin')) {
            const centerPin = document.createElement('div');
            centerPin.classList.add('center-pin');
            rouletteWheel.appendChild(centerPin);
        }

        updateSpinButtonState();
        updateResetButtonState();
    };

    // Function to add a new option
    const addOption = () => {
        const newOption = newOptionInput.value.trim();
        if (newOption && !foodOptions.includes(newOption)) {
            foodOptions.push(newOption);
            newOptionInput.value = '';
            saveOptions();
            renderOptions();
        } else if (newOption === "") {
            alert("Please enter a dinner idea!");
        } else if (foodOptions.includes(newOption)) {
            alert("This option already exists!");
        }
    };

    // Function to remove an option
    const removeOption = (index) => {
        foodOptions.splice(index, 1);
        saveOptions();
        renderOptions();
        // If the currently displayed food was removed, reset display
        if (foodOptions.length === 0 || !foodOptions.includes(chosenFoodDisplay.textContent)) {
             chosenFoodDisplay.textContent = 'Click \'Spin\' to find out!';
        }
        rouletteWheel.style.transform = `rotate(0deg)`; // Reset wheel visually after change
    };

    addOptionBtn.addEventListener('click', addOption);

    newOptionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addOption();
        }
    });

    optionsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const indexToRemove = parseInt(e.target.dataset.index);
            removeOption(indexToRemove);
        }
    });

    const updateSpinButtonState = () => {
        spinBtn.disabled = foodOptions.length < 1; // Allow spinning with 1 option (it just picks that one)
        if (spinBtn.disabled) {
            spinBtn.title = "Add at least one option to spin the wheel.";
        } else {
            spinBtn.title = "";
        }
    };

    const updateResetButtonState = () => {
        if (foodOptions.length > 0) {
            resetBtn.classList.remove('hidden');
        } else {
            resetBtn.classList.add('hidden');
        }
    };

    spinBtn.addEventListener('click', () => {
        if (foodOptions.length === 0) {
            alert("Please add at least one dinner option to spin the wheel!");
            return;
        }

        const numSegments = foodOptions.length;
        const segmentAngle = 360 / numSegments;
        const chosenIndex = Math.floor(Math.random() * numSegments); // The index of the chosen food
        const chosenFood = foodOptions[chosenIndex];

        // Calculate the target rotation to land the chosen segment at the top (under the arrow)
        // The arrow is pointing upwards (0 degrees). Segments are created clockwise.
        // We want the middle of the chosen segment to align with the top.
        // We also want to spin multiple times (e.g., 5 full rotations)
        const currentRotation = parseFloat(rouletteWheel.style.transform.replace('rotate(', '').replace('deg)', '')) || 0;

        // Calculate the center of the chosen segment. Segments start at 0 (top), so first segment is 0-X degrees.
        // The center of the '0' index segment is segmentAngle / 2.
        // For '1' index, it's segmentAngle + segmentAngle/2.
        const targetSegmentCenter = (chosenIndex * segmentAngle) + (segmentAngle / 2);

        // We need to rotate the wheel such that this `targetSegmentCenter` is at 270 degrees (relative to arrow at 0 degrees,
        // or 0 degrees if we consider the arrow at the 'top' of the wheel and the wheel rotates).
        // If the arrow is fixed at the top (0 degrees, or 360 degrees, or 720 degrees, etc.),
        // and our segments are laid out clockwise from the top, then the target position for the wheel
        // would be `360 - targetSegmentCenter`.

        // Let's refine target calculation:
        // Assume arrow is at 0 degrees (top).
        // Segment 0 center is at 0 + angle/2.
        // If we want segment 0 to land at 0, wheel rotates -angle/2.
        // If we want segment N to land at 0, wheel rotates -(N * angle + angle/2)
        let totalRotation = 360 * 5 + (360 - targetSegmentCenter); // Spin 5 times + land at correct spot
        
        // To ensure it lands precisely on the chosen segment and aligns with the arrow,
        // we can adjust `totalRotation` relative to the current rotation.
        // We want the wheel's final position to be `X` such that `(X + targetSegmentCenter)` modulo 360 is `0` (or `360`).
        // Alternatively, calculate based on where the arrow is (top/0 deg)
        const finalDegreeForArrow = 0; // Where the arrow "points" on the wheel (top)
        let degreesToRotate = finalDegreeForArrow - targetSegmentCenter;

        // Ensure it spins multiple full rotations
        degreesToRotate += (360 * 5); // Add 5 full rotations

        // If the initial rotation is significant, we might need to adjust `degreesToRotate`
        // so it always spins forward. For simplicity, we just apply the new absolute rotation.

        rouletteWheel.classList.add('spinning');
        rouletteWheel.style.transform = `rotate(${degreesToRotate}deg)`;
        spinBtn.disabled = true;
        addOptionBtn.disabled = true;

        chosenFoodDisplay.textContent = 'Spinning...'; // Show spinning text

        const previousSelected = document.querySelector('.selected-option');
        if (previousSelected) {
            previousSelected.classList.remove('selected-option');
        }

        // The timeout duration should match the CSS transition duration
        setTimeout(() => {
            rouletteWheel.classList.remove('spinning');
            spinBtn.disabled = false;
            addOptionBtn.disabled = false;

            chosenFoodDisplay.textContent = chosenFood; // Display the final chosen food

            const listItems = Array.from(optionsList.children);
            const chosenItem = listItems.find(li => li.querySelector('span').textContent === chosenFood);
            if (chosenItem) {
                chosenItem.classList.add('selected-option');
                chosenItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 5200); // 5.2 seconds, slightly longer than CSS transition (5s)
    });

    resetBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all dinner options?")) {
            foodOptions = [];
            saveOptions();
            renderOptions();
            chosenFoodDisplay.textContent = 'Click \'Spin\' to find out!';
            rouletteWheel.style.transform = `rotate(0deg)`; // Reset wheel visually
        }
    });

    renderOptions(); // Initial render when the page loads
});
