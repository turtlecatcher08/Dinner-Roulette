document.addEventListener('DOMContentLoaded', () => {
    const newOptionInput = document.getElementById('newOptionInput');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const optionsList = document.getElementById('optionsList');
    const spinBtn = document.getElementById('spinBtn');
    const resetBtn = document.getElementById('resetBtn');
    const chosenFoodDisplay = document.getElementById('chosenFoodDisplay');
    const rouletteWheel = document.querySelector('.roulette-wheel');

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

    // Function to render the list of options
    const renderOptions = () => {
        optionsList.innerHTML = ''; // Clear existing list
        if (foodOptions.length === 0) {
            optionsList.innerHTML = '<li style="text-align: center; color: #888;">No options added yet. Add some!</li>';
        }
        foodOptions.forEach((option, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${option}</span>
                <button class="remove-btn" data-index="${index}">Remove</button>
            `;
            optionsList.appendChild(li);
        });
        updateSpinButtonState();
        updateResetButtonState();
    };

    // Function to add a new option
    const addOption = () => {
        const newOption = newOptionInput.value.trim();
        if (newOption && !foodOptions.includes(newOption)) { // Prevent duplicates
            foodOptions.push(newOption);
            newOptionInput.value = ''; // Clear input field
            saveOptions();
            renderOptions();
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
    };

    // Handle adding option via button click
    addOptionBtn.addEventListener('click', addOption);

    // Handle adding option via Enter key in input field
    newOptionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addOption();
        }
    });

    // Handle removing options via event delegation on the list
    optionsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const indexToRemove = parseInt(e.target.dataset.index);
            removeOption(indexToRemove);
        }
    });

    // Function to update the disabled state of the spin button
    const updateSpinButtonState = () => {
        spinBtn.disabled = foodOptions.length < 2; // Need at least 2 options to spin
        if (spinBtn.disabled) {
            spinBtn.title = "Add at least two options to spin the wheel.";
        } else {
            spinBtn.title = "";
        }
    };

    // Function to update the visibility of the reset button
    const updateResetButtonState = () => {
        if (foodOptions.length > 0) {
            resetBtn.classList.remove('hidden');
        } else {
            resetBtn.classList.add('hidden');
        }
    };

    // Spin the wheel!
    spinBtn.addEventListener('click', () => {
        if (foodOptions.length < 2) {
            alert("Please add at least two dinner options to spin the wheel!");
            return;
        }

        // Add spinning class for visual animation
        rouletteWheel.classList.add('spinning');
        spinBtn.disabled = true; // Disable button during spin
        addOptionBtn.disabled = true; // Disable adding options during spin

        // Remove previous selected class
        const previousSelected = document.querySelector('.selected-option');
        if (previousSelected) {
            previousSelected.classList.remove('selected-option');
        }

        // Simulate spin duration (matching CSS transition)
        setTimeout(() => {
            const chosenFood = foodOptions[Math.floor(Math.random() * foodOptions.length)];
            chosenFoodDisplay.textContent = chosenFood;
            rouletteWheel.classList.remove('spinning'); // Remove spinning class
            spinBtn.disabled = false; // Re-enable button
            addOptionBtn.disabled = false; // Re-enable adding options

            // Highlight the chosen food in the list (optional, adds nice UX)
            const listItems = Array.from(optionsList.children);
            const chosenItem = listItems.find(li => li.querySelector('span').textContent === chosenFood);
            if (chosenItem) {
                chosenItem.classList.add('selected-option');
                chosenItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Scroll to it
            }

        }, 3000); // 3 seconds, matching CSS transition for spin
    });

    // Reset Options
    resetBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all dinner options?")) {
            foodOptions = [];
            saveOptions();
            renderOptions();
            chosenFoodDisplay.textContent = 'Click \'Spin\' to find out!';
        }
    });

    // Initial render when the page loads
    renderOptions();
});
