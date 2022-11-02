{
    init: function(elevators, floors) {
        const maxFloor = floors.length - 1;
        
        elevators.forEach((elevator) => {
            elevator.on("stopped_at_floor", () => {
                const currentFloor = elevator.currentFloor(),
                    hasPressedButtons = elevator.getPressedFloors().length > 0,
                    direction = elevator.goingDownIndicator() ? "down" : "up",
                    currentFloorNeedsMe = floors[currentFloor].buttonStates[direction] === "activated";
                    
                if (hasPressedButtons) {
                    // already going to a floor, nothing to change
                } else if (!currentFloorNeedsMe) {
                    calculateNextElevatorDestination(elevator);
                }
            });
            
            elevator.on("floor_button_pressed", floorNum => {
                if (!elevator.destinationQueue.includes(floorNum)) {
                    elevator.destinationQueue.push(floorNum);
                    sortElevatorQueue(elevator);
                    elevator.checkDestinationQueue();
                }
            });
            
            elevator.on("passing_floor", (floorNum, direction) => {
                const floor = floors[floorNum],
                    pressedFloors = elevator.getPressedFloors(),
                    elevatorDirection = elevator.goingDownIndicator() ? "down" : "up",
                    relevantButtonIsActivated = !!floor.buttonStates[elevatorDirection],
                    approximateNumberOfExistingPassengers = Math.ceil(elevator.loadFactor() * elevator.maxPassengerCount()),
                    elevatorHasRoom = approximateNumberOfExistingPassengers < elevator.maxPassengerCount();
                
                if (pressedFloors.includes(floorNum)) {
                    elevator.goToFloor(floorNum, true);
                } else if (relevantButtonIsActivated && elevatorHasRoom && !isFloorRequestBeingHandled(floorNum, elevator)) {
                    elevator.goToFloor(floorNum, true);
                }
            });
        });
        
        floors.forEach(floor => {
            floor.on("up_button_pressed", () => handleFloorButtonPress(floor, "up"));
            floor.on("down_button_pressed", () => handleFloorButtonPress(floor, "down"));
        });
        
        
		// Search and status functions
        findIdleElevator = () => elevators.find(e => isElevatorAvailable(e));
        
        isElevatorAvailable = elevator => {
            return elevator.loadFactor() === 0 && // elevator has no passengers
                !elevator.destinationQueue.some(f => isFloorRequestingElevator(f)); // elevator is not already dealing with a floor request
        };
        
        isFloorRequestingElevator = floorNum => Object.values(floors[floorNum].buttonStates).some(state => state === "activated");
        
        isFloorRequestBeingHandled = (floorNum, currentElevator) => {
            const checkDirectionIndicator = currentElevator.destinationDirection() === "up"
                ? e => e.goingUpIndicator()
                : e => e.goingDownIndicator();
            return elevators.some(e => e !== currentElevator && checkDirectionIndicator(e) && e.destinationQueue.includes(floorNum));
        };
        
		// Utility functions
        function calculateNextElevatorDestination(elevator) {
            const preferDown = elevator.currentFloor() > maxFloor / 2,
                floorsRequestingDown = floors.filter(f => f.buttonStates.down === "activated"),
                floorsRequestingUp = floors.filter(f => f.buttonStates.up === "activated"),
                currentFloor = elevator.currentFloor();
            let nextDirection = null;
            
            // It's possible that we won't need to take any action because no one is requesting anything right this moment.
            // In that case, we won't give a value to nextDirection
            if (preferDown) {
                if (floorsRequestingDown.length > 0) {
                    nextDirection = "down";
                } else if (floorsRequestingUp.length > 0) {
                    nextDirection = "up";
                }
            } else {
                if (floorsRequestingUp.length > 0) {
                    nextDirection = "up";
                } else if (floorsRequestingDown.length > 0) {
                    nextDirection = "down";
                }
            }
            
            if (nextDirection === "down") {
                // Start at the highest floor currently requesting downward passage
                const floorNum = Math.max(...floorsRequestingDown.map(f => f.floorNum()));
                if (floorNum !== currentFloor) {
                    elevator.stop();
                    elevator.goToFloor(floorNum);
                }
            } else if (nextDirection === "up") {
                // Start at the lowest floor currently requesting upward passage
                const floorNum = Math.min(...floorsRequestingUp.map(f => f.floorNum()));
                if (floorNum !== currentFloor) {
                    elevator.stop();
                    elevator.goToFloor(floorNum);
                }
            }
            
            markElevatorDirectionIndicators(elevator, nextDirection);
        }
		
        function handleFloorButtonPress(floor, direction) {
            const floorNum = floor.floorNum(),
                idleElevator = findIdleElevator();
                
            if (!!idleElevator) {
                idleElevator.stop();
                idleElevator.goToFloor(floorNum, true);
                markElevatorDirectionIndicators(idleElevator, direction);
            }
        }
        
        function markElevatorDirectionIndicators(elevator, direction) {
            elevator.goingDownIndicator(direction === "down");
            elevator.goingUpIndicator(direction === "up");
        }
        
        function sortElevatorQueue(elevator) {
            elevator.destinationQueue.sort();
            if (elevator.destinationDirection() === "down") {
                elevator.destinationQueue.reverse();
            }
        }
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
