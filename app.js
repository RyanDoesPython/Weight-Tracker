const mainScreen = document.getElementById("mainSection");
const addWeightScreen = document.getElementById("addWeightScreen");

//Buttons and Inputs
const weightInput = document.getElementById("weightInput");
const dateInput = document.getElementById("dateInput");
const submitButton = document.getElementById("submitButton");
const addNewWeightButton = document.getElementById("addNewWeightButton");
const userButton = document.getElementById("userButton");
const nameInput = document.getElementById("nameInput");
const heightInput = document.getElementById("heightInput");
const weightGoalInput = document.getElementById("weightGoalInput");
const closeButton = document.getElementById("closeButton");
const closeWeightScreenButton = document.getElementById("closeWeightScreenButton");
const clearData = document.getElementById("clearData");

const profileWindow = document.getElementById("profileWindow");
const welcomeBackText = document.getElementById("welcomeBackText");

//BMI section
const BMINumber = document.getElementById("BMINumber");
const BMIText = document.getElementById("BMIText");

const dataSet = [];

// Function to create the weight chart
const createLineGraph = () => {
    const dataset = dataSet;

    // Clear previous SVG if it exists
    d3.select("#graph").selectAll("*").remove();

    const w = screen.width * 0.6;
    const h = screen.height * 0.35;
    const padding = 60;

    // Parse dates
    const parsedData = dataset.map(d => [parseFloat(d[0]), new Date(d[1])]);

    parsedData.sort((a, b) => b[1] - a[1]);
        

    // X and Y scales
    const xScale = d3.scaleTime()
        .domain([
            d3.min(parsedData, (d) => d[1]),
            d3.max(parsedData, (d) => d[1])
        ])
        .range([padding, w - padding]);

    const yScale = d3.scaleLinear()
        .domain([
            d3.min(parsedData, (d) => d[0]),
            d3.max(parsedData, (d) => d[0])
        ])
        .range([h - padding, padding]);

    // Line generator (updated to use d[0] for weight and d[1] for date)
    const line = d3.line()
        .x(d => xScale(d[1]))  // d[1] is the date
        .y(d => yScale(d[0]))  // d[0] is the weight
        .curve(d3.curveMonotoneX);

    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    const xAxis = d3.axisBottom(xScale).ticks(dataSet.length > 10 ? 10 : dataSet.length);
    const yAxis = d3.axisLeft(yScale).ticks(3);

    // Append the X axis
    svg.append("g")
        .attr("transform", `translate(0, ${h - padding})`)
        .attr("class", "xAxis")
        .call(xAxis)
        .selectAll("path")   // Target the path element of the axis
        .attr("class", "axis")  // Apply the dashed pattern
        .attr("stroke", "rgba(131, 132, 144, 1)");  // Change line color

    // Set tick text color for X axis
    svg.selectAll(".xAxis text")
        .style("fill", "rgba(131, 132, 144, 1)"); // Change text color

    // Append the Y axis
    svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .attr("class", "yAxis")
        .call(yAxis)
        .selectAll("path")   // Target the path element of the axis
        .attr("class", "axis")  // Apply the dashed pattern
        .attr("stroke", "rgba(131, 132, 144, 1)");  // Change line color

    // Set tick text color for Y axis
    svg.selectAll(".yAxis text")
        .style("fill", "rgba(131, 132, 144, 1)"); // Change text color

    const area = d3.area()
        .x(d => xScale(d[1]))  // d[1] is the date
        .y1(d => yScale(d[0]))
        .y0(h - padding)
        .curve(d3.curveMonotoneX);

    svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")  // This is the ID we will reference later
        .attr("x1", "0%")   // Start of the gradient (left side)
        .attr("y1", "0%")
        .attr("x2", "0%")   // End of the gradient (right side)
        .attr("y2", "100%") // Goes vertically (top to bottom)
        .selectAll("stop")
        .data([
            {offset: "0%", color: "rgba(26, 255, 213, 0.8)"},   // Start color (at the top)
            {offset: "100%", color: "rgba(26, 255, 213, 0)"}  // End color (at the bottom)
        ])
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    svg.append("path")
       .datum(parsedData)  // Bind parsedData to the path
       .attr("fill", "url(#gradient)")  // Light fill color
       .attr("d", area);
    // Append the line path

    svg.append("path")
        .datum(parsedData)  // Bind parsedData to the path
        .attr("stroke", "rgba(26, 255, 213, 1)")
        .attr("stroke-width", 2)
        .attr("fill", "transparent")
        .attr("d", line);

    // Append circles to mark data points
    svg.selectAll("circle")  // Make sure to select 'circle'
        .data(parsedData)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", d => xScale(d[1]))  // d[1] is the date
        .attr("cy", d => yScale(d[0]))  // d[0] is the weight
        .attr("r", 6)
};

// Calculates the BMI and sets the text
const setBMI = () => {
    const BMI = (dataSet.length - 1) >= 0 ? ((dataSet[dataSet.length - 1][0] / (heightInput.value * heightInput.value)) * 703).toFixed(2) : undefined;

    //set text
    BMINumber.innerHTML = BMI;

    if(BMI <= 18.5){
        BMIText.innerHTML = "You're underweight";
        BMIText.style.color = "rgba(96, 194, 251, 1)"
    } else if(BMI > 18.5 && BMI <= 24.9){
        BMIText.innerHTML = "You're Healthy"
        BMIText.style.color = "rgba(26, 255, 216, 1)"
    } else if(BMI > 24.9 && BMI <= 29.9){
        BMIText.innerHTML = "You're Overweight"
        BMIText.style.color = "rgba(239, 200, 53, 1)"
    } else if(BMI > 29.9){
        BMIText.innerHTML = "You're Obese"
        BMIText.style.color = "rgba(255, 78, 99, 1)"
    }

    return BMI;

}

// Creates the BMI scale
const createBMIScale = () => {
    // Ensure container is cleared before adding new content
    d3.select("#BMIGraph").selectAll("*").remove();

    const w = screen.width * 0.55;  // Width of the graph
    const h = 130; // Height of the graph
    const padding = 60;  // Padding for the axis\
    const shiftVale = -40

    // X scale for BMI
    const BMIxScale = d3.scaleLinear()
        .domain([15, 40])  // BMI domain (min to max)
        .range([padding, w - padding]);  // Range based on the width

    // Create the SVG element
    const svg = d3.select("#BMIGraph")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "BMISvg")

    // Create the xAxis
    const xAxis = d3.axisBottom(BMIxScale)
        .tickValues([15, 18.5, 25, 30, 40]);

    // Append the xAxis to the SVG
    svg.append("g")
        .attr("transform", `translate(${shiftVale}, ${h - padding})`)
        .attr("class", "BMIxAxis")
        .call(xAxis);

    svg.selectAll("text")
        .style("fill", "rgba(131, 132, 144, 1)");  // Change text color

    //58 ticks? might want to recount
    const pointCount = 58;
    const minValue = 15;
    const maxValue = 40;
    const step = (maxValue - minValue) / (pointCount - 1);  // Calculate step size
    
    const BMI = (dataSet.length - 1) >= 0 ? ((dataSet[dataSet.length - 1][0] / (heightInput.value * heightInput.value)) * 703).toFixed(2) : undefined;

    const points = d3.range(minValue, maxValue + step, step);  // Generate 58 points

    points.forEach(pointValue => {
        svg.append("rect")
            .attr("class", "BMIRect")
            .attr("x", BMIxScale(pointValue) + shiftVale)  // Use BMIxScale to position the circle
            .attr("y", h - 100)  // Align it with the x-axis
            .attr("width", 5)  // Radius of the circle
            .attr("height", 30)
            .attr("rx", 1.5)
            .attr("ry", 1.5)
            .attr("fill", () => {
                if(pointValue <= 18.5){
                    return "rgba(96, 194, 251, 1)"
                } else if(18.5 < pointValue && pointValue <= 25){
                    return "rgba(26, 255, 216, 1)"
                } else if (25 < pointValue && pointValue <= 30){
                    return "rgba(239, 200, 53, 1)"
                } else if (30 < pointValue && pointValue <= 40){
                    return "rgba(255, 78, 99, 1)"
                }
                
            })
    });

    function findNearestValue(arr, num) {
        return arr.reduce((prev, curr) => {
            return (Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev);
        });
    }

    const closestPoint = findNearestValue(points, BMI);

    svg.append("rect")
        .attr("class", "BMIRect")
            .attr("x", BMIxScale(closestPoint) + shiftVale)  // Use BMIxScale to position the circle
            .attr("y", h - 110)  // Align it with the x-axis
            .attr("width", 5)  // Radius of the circle
            .attr("height", 50)
            .attr("rx", 1.5)
            .attr("ry", 1.5)
            .attr("fill", () => {
                if(BMI <= 18.5){
                    return "rgba(96, 194, 251, 1)"
                } else if(18.5 < BMI && BMI <= 25){
                    return "rgba(26, 255, 216, 1)"
                } else if (25 < BMI && BMI <= 30){
                    return "rgba(239, 200, 53, 1)"
                } else {
                    return "rgba(255, 78, 99, 1)"
                }
                
            })
}

const createHistoryElements = () => {
    const historySection = document.getElementById("history");
    historySection.innerHTML = "";

    const currentDate = new Date();
    const elements = {};
    
    console.log(elements);
    
    // Step 1: Sort the dataset by date (ascending)
    const sortedDataSet = dataSet.sort((a, b) => new Date(a[1]) - new Date(b[1]));
    
    sortedDataSet.forEach((d, index) => {
        // Get weight and date from the sorted dataset
        const weight = d[0];
        const targetDateString = d[1];

        const targetDate = new Date(targetDateString);
        const differenceInMs = currentDate - targetDate;
        const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

        // Calculate weight change from the previous entry
        let weightChange = 0;
        if (index > 0) {
            const previousWeight = sortedDataSet[index - 1][0]; // Previous weight
            weightChange = weight - previousWeight; // Change in weight
        }

        // Create an object for the current entry
        elements[index + 1] = {
            daysSince: differenceInDays,
            weightChange: weightChange,
            weight: weight
        };

        console.log(`Entry ${index + 1}: ${differenceInDays} days since, Weight change: ${weightChange}`);
    });

    Object.keys(elements).reverse().forEach(key => {
        const element = elements[key];
        
        historySection.innerHTML += `
            <div class="entryElement">
                <div class="leftSection">
                    <div class="daysSinceText">
                        <p>${
                            element.daysSince == 0 ? "Today" : element.daysSince == 1 ? "Yesterday" : `${element.daysSince} days ago`
                        }</p>
                    </div>
                    <div class="${element.weightChange > 0 ? "weightChangeBad" : "weightChangeGood"}">
                        <svg width="30" height="30" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path class="${element.weightChange > 0 ? "arrow-up" : "arrow-down"}" d="M24 38V10M24 10L10 24M24 10L38 24" stroke="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg> 
                        <p>${Math.abs(element.weightChange)} lb</p>
                    </div>
                </div>
                <div class="rightSection">
                    <p class="weightText"><span class="weightNumber">${element.weight}</span><span>lb</span></p>
                    <button class="options">
                        <svg width="10.5" height="34.5" viewBox="0 0 7 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="3.13889" cy="3.13889" r="3.13889" fill="white"/>
                            <circle cx="3.13889" cy="11.3" r="3.13889" fill="white"/>
                            <circle cx="3.13889" cy="19.4611" r="3.13889" fill="white"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

    });
}    




// Opens the new weight screen
addNewWeightButton.addEventListener("click", () => {
    mainScreen.style.display = "none";
    addWeightScreen.style.display = "block";
});

// Closes the new weight screen
closeWeightScreenButton.addEventListener("click", () => {
    mainScreen.style.display = "block";
    addWeightScreen.style.display = "none";
})

// Sets and loads local storage
const loadDataFromLocalStorage = () => {
    const storedData = localStorage.getItem("weightData");
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        dataSet.push(...parsedData);
    }
};

const saveDataToLocalStorage = () => {
    localStorage.setItem("weightData", JSON.stringify(dataSet));
}

loadDataFromLocalStorage();

// Adds a new weight
submitButton.addEventListener("click", () => {
    if (weightInput.value && dateInput.value) {
        if(!dataSet.some(subArray => subArray[1] === dateInput.value)){
            dataSet.push([weightInput.value, dateInput.value]);
        } else {
            const dupPosition = dataSet.findIndex(subArray => subArray[1] === dateInput.value);
            dataSet[dupPosition] = [weightInput.value, dateInput.value];
        }
        createLineGraph(); // Call the function to create the chart
        setBMI();
        createBMIScale();
        createHistoryElements();

        saveDataToLocalStorage();
    }
    mainScreen.style.display = "block";
    addWeightScreen.style.display = "none";
})

//Opens and closes the user profile
userButton.addEventListener("click", () => {
    if (profileWindow.style.display === "none") {
        profileWindow.style.display = "flex";  // Show if hidden
    } else {
        profileWindow.style.display = "none";   // Hide if visible
        setBMI();
        createBMIScale();
        welcomeBackText.innerHTML = `Welcome back ${nameInput.value}`
    }
});

closeButton.addEventListener("click", () => {
    profileWindow.style.display = "none";
    setBMI();
    createBMIScale();
    welcomeBackText.innerHTML = `Welcome back ${nameInput.value}`
});

clearData.addEventListener("click", () => {
    dataSet.length = 0;
    createLineGraph(); // Call the function to create the chart
    BMIText.innerHTML = "";
    BMINumber.innerHTML = "";
    createBMIScale();
    saveDataToLocalStorage();
    createHistoryElements();
})

window.onload = () => {
    createLineGraph(); // Call to create the weight line graph
    createBMIScale();  // Call to create the BMI scale
    setBMI();
    createHistoryElements();
    welcomeBackText.innerHTML = ``
    console.log(dataSet)
};
