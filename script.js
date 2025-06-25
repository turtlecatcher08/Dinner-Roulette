document.addEventListener('DOMContentLoaded', () => {
    const newOptionInput = document.getElementById('newOptionInput');
    const addOptionBtn = document.getElementById('addOptionBtn');
    const optionsList = document.getElementById('optionsList');
    const spinBtn = document.getElementById('spinBtn');
    const resetBtn = document.getElementById('resetBtn');
    const chosenFoodDisplay = document.getElementById('chosenFoodDisplay');
    const rouletteWheel = document.getElementById('rouletteWheel');
    const rouletteWrapper = document.querySelector('.roulette-wrapper'); // Added

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
        rouletteWheel.innerHTML = ''; // Clear existing segments

        if (foodOptions.length === 0) {
            optionsList.innerHTML = '<li style="text-align: center; color: #888;">No options added yet. Add some!</li>';
            // Optionally handle empty roulette visually
            return;
        }

        // Render options list
        foodOptions.forEach((option, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${option}</span>
                <button class="remove-btn" data-index="${index}">Remove</button>
            `;
            optionsList.appendChild(li);

            // Create roulette segments dynamically
            const segment = document.createElement('div');
            segment.classList.add('segment');
            segment.style.setProperty('--i', index);
            // You could add text to the segments if you have fewer options
            // segment.textContent = option;
            rouletteWheel.appendChild(segment);

            // Update segment clipping for different numbers of options
            const numSegments = foodOptions.length;
            const angle = 360 / numSegments;
            segment.style.clipPath = `polygon(50% 50%, 50% 0%, calc(50% + 86.6% * cos(calc(${index} * ${angle}deg + ${angle / 2}deg))) calc(50% + 86.6% * sin(calc(${index} * ${angle}deg + ${angle / 2}deg))))`;
        });

        // Update the number of segments in CSS (optional, but can make styling easier)
        rouletteWheel.style.setProperty('--segments', numSegments);

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
        } else if (foodOptions.includes(newOption)) {
            alert("This option already exists!");
        }
    };

    // Function to remove an option
    const removeOption = (index) => {
        foodOptions.splice(index, 1);
        saveOptions();
        renderOptions();
        if (foodOptions.length === 0 || !foodOptions.includes(chosenFoodDisplay.textContent)) {
             chosenFoodDisplay.textContent = 'Click \'Spin\' to find out!';
        }
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
        spinBtn.disabled = foodOptions.length < 2;
        if (spinBtn.disabled) {
            spinBtn.title = "Add at least two options to spin the wheel.";
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
        if (foodOptions.length < 2) {
            alert("Please add at least two dinner options to spin the wheel!");
            return;
        }

        const numSegments = foodOptions.length;
        const rotationDegrees = 360 / numSegments;
        const winningSegmentIndex = Math.floor(Math.random() * numSegments);
        const spinAmount = 360 * 5 + winningSegmentIndex * rotationDegrees - rotationDegrees / 2; // Spin 5 times + land near the center of the winning segment

        rouletteWheel.classList.add('spinning');
        spinBtn.disabled = true;
        addOptionBtn.disabled = true;

        const previousSelected = document.querySelector('.selected-option');
        if (previousSelected) {
            previousSelected.classList.remove('selected-option');
        }

        setTimeout(() => {
            rouletteWheel.classList.remove('spinning');
            spinBtn.disabled = false;
            addOptionBtn.disabled = false;

            const chosenFood = foodOptions[(Math.floor(spinAmount / rotationDegrees)) % numSegments];
            chosenFoodDisplay.textContent = chosenFood;

            const listItems = Array.from(optionsList.children);
            const chosenItem = listItems.find(li => li.querySelector('span').textContent === chosenFood);
            if (chosenItem) {
                chosenItem.classList.add('selected-option');
                chosenItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 5200); // Slightly longer than CSS transition
        rouletteWheel.style.transform = `rotate(${spinAmount}deg)`;
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

    renderOptions(); // Initial render now creates roulette segments too
});
