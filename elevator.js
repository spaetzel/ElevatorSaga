{
    init: function(elevators, floors) {
        this.elevators = elevators;
        this.floors = floors;
        this.pickupQueue = [];
        var self = this;

        

       
        for( var i = 0; i<floors.length; i++){
            var floor = floors[i];
     
            floor.on('up_button_pressed', function(){

                if( self.pickupQueue.indexOf(this.floorNum() == -1 )){
                    for( var j = 0; j<elevators.length; j++){
                        var elevator = elevators[j];

                        if( elevator.loadFactor() < 1  ){

                            self.setIndicators(elevator, true);

                            self.goToFloor( elevator, this.floorNum());
                            self.pickupQueue.push(this.floorNum());
                            break;
                        }
                    }
                }
            });
            
            
            
            floor.on('down_button_pressed', function(){
                if( self.pickupQueue.indexOf(this.floorNum() == -1 )){
                    for( var j = 0; j<elevators.length; j++){


                        var elevator = elevators[elevators.length - j -1 ];

                        if( elevator.loadFactor() < 1 ){

                            self.setIndicators(elevator, false);

                            self.goToFloor( elevator, this.floorNum() );
                            self.pickupQueue.push(this.floorNum());
                            break;
                        }
                    }
                }
            }); 
                     
        }
            
        
        for( var i =0;i<elevators.length; i++){

            var elevator = elevators[i];
            elevator.requestQueue = [];


            elevator.on('floor_button_pressed ', function(floorNum){
               if( this.destinationQueue.indexOf(floorNum) == -1 && this.destinationQueue.length < floors.length ){
                   
                   self.removeDestinationFromOthers(floorNum);
                   this.requestQueue.push(floorNum);

                     self.goToFloor(this, floorNum);
               }
                
           });
            
            elevator.on("idle", function() {
                // The elevator is idle, so let's go to all the floors (or did we forget one?)

                elevator.goToFloor(i);
            });

       /*    elevator.on('passing_floor', function(floorNum, direction){
                if( this.loadFactor() < 1 && this.destinationQueue.indexOf(floorNum) != -1 ){
                    this.goToFloor(floorNum, true);
                }
            });
*/

            elevator.on('stopped_at_floor', function(floorNum){
                self.removeDestination(this, floorNum, true);

                 var index =self.pickupQueue.indexOf(floorNum);

                if( index > -1 ){
                    self.pickupQueue.splice(index, 1);
                }

                if( floorNum == 0 ){
                    self.setIndicators(elevator, true);
                }else if ( floorNum == floors.length ){
                    self.setIndicators(elevator, false);
                }



            });



        }
        
        
        
        
    },
    setIndicators: function(elevator, up){
        console.log('indicate', up);
         elevator.goingUpIndicator(up);
        elevator.goingDownIndicator(!up);
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    },
    goToFloor: function( elevator, floorNum ){
        elevator.destinationQueue.push(floorNum);
        var above = [];
        var below = [];

        var aboveIndex = 0; // the index in the queue where the floors are above the current floor
        for( var i = 0; i< elevator.destinationQueue.length; i++ ){
            if( elevator.destinationQueue[i] > elevator.currentFloor() ){
                above.push(elevator.destinationQueue[i]);
            }else if ( elevator.destinationQueue[i] < elevator.currentFloor() ){
                below.push(elevator.destinationQueue[i]);
            }
        }

        above.sort(); // Sort ascending
        below.sort(); // Sort descending
        below.reverse();

        var newQueue;

        if ( below.length > above.length ){
            // More floors are below the current floor than above, go down first
            console.log('down',  elevator.currentFloor(), above, below);



           newQueue = below.concat(above);
        }else{
            console.log('up', elevator.currentFloor(), above, below);

 
            newQueue= above.concat(below);
        }

        elevator.destinationQueue = newQueue;
        elevator.checkDestinationQueue();
    },
    notInQueue: function(floorNum){
        for( var i =0;i<this.elevators.length; i++){
            var elevator = this.elevators[i];

            console.log('q', elevator);

            if( elevator.loadFactor < 1 && elevator.destinationQueue.indexOf(floorNum) != -1 ){
                console.log(queue, elevator.loadFactor);
                return false;
            }

        }

        return true;
    },
    removeDestinationFromOthers: function(elevator, floorNum){
         for( var i =0;i<this.elevators.length; i++){
            if( elevator != this.elevators[i]){
                this.removeDestination( this.elevators[i], floorNum );
            }

        }
    },
    floorRequested: function(elevator, floorNum ){
        return elevator.requestQueue.indexOf(floorNum);
    },
    removeDestination: function(elevator, floorNum, force ){
        if( force || !this.floorRequested( elevator, floorNum) ){
            var index = elevator.destinationQueue.indexOf(floorNum);

            if( index > -1 ){

                elevator.destinationQueue.splice(index, 1);
                elevator.checkDestinationQueue();
            }

            var index2 = elevator.requestQueue.indexOf(floorNum);

            if( index2 > -1 ){

                elevator.requestQueue.splice(index2, 1);
            }
        }
    }
}