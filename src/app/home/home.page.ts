import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  number: any = 5;
  row: number[];
  column: number[];
  inputValue:any;
  state: any;
  current_coordinate: any;
  robot_direction: string;
  isMoved : boolean = false;
  command_array : any=[];

    COMMANDS = ['PLACE'];
    DIRECTIONS = ["NORTH","EAST","SOUTH","WEST"];

//Possible errors
  ERRORS = {
    invalid_command: "Invalid command . Available command is PLACE ",
    invalid_initial_command: "Invalid PLACE command format. The valid PLACE command should be 'PLACE X,Y,F' where F represents NORTH|EAST|SOUTH|WEST.",
    not_initialized: "The robot is not placed on the table yet. Place it first with 'PLACE X,Y,F'",
    wrong_place: "The robot was placed out of the table",
    wrong_moving_direction: "The robot can't move forward on that direction, it may fall off the table."
  };
  show_data: boolean = false;

  constructor(public toastController: ToastController) {
    this.row = [...Array(this.number).keys()].reverse();
    this.column = [...Array(this.number).keys()];
    this.robot_direction = "robot_east";
    this.current_coordinate = "0,0";
    this.state = [0,0,"east"];
  }

  // Below method will be called when user tries to PLACE the robot from Input
  submitDecision(value){
    this.show_data = false;
   
    //Split the input value if valid format else thorw error
      var space_value = value?value.split(" "):"";
      if(this.COMMANDS.includes(space_value[0])){
        //validate if PLACE and X,Y,F in correct length i.e 2 entities
          if(space_value.length>1 && space_value.length<3){
              var second_half = space_value[1].split(",")
              //validate if second half value has 3 element in array as X,Y,F
            if(second_half.length==3){
              //validating if X,Y is number , not decimal , not string and facing is valid
              if(typeof(parseInt(second_half[0]))=="number" &&
               typeof(parseInt(second_half[1]))=="number" && 
               typeof(second_half[2])=="string" && 
               second_half[0]%1==0 &&
               second_half[1]%1==0 &&
               this.DIRECTIONS.includes(second_half[2].toUpperCase())){
                 //validating if entered value is not grater than board
                if(second_half[0]>this.number-1 || second_half[1]>this.number-1 || second_half[0]<0 || second_half[1]<0){
                    this.presentToast(this.ERRORS.wrong_place);
                }else{
                  this.command_array = [];
                  this.command_array.push(value);
                  this.isMoved = true;
                  this.state = second_half;
                  const xyCoordinate = this.state;
                  this.current_coordinate = xyCoordinate[1]+","+xyCoordinate[0];
                  if(xyCoordinate[2]) this.robot_direction = "robot_"+ xyCoordinate[2].toLowerCase();
                }
              }else{
                this.presentToast(this.ERRORS.invalid_initial_command);
              }
            }else{
              this.presentToast(this.ERRORS.invalid_initial_command);
            }
            }else{
              this.presentToast(this.ERRORS.invalid_initial_command);
            }
      }else{
        this.presentToast(this.ERRORS.invalid_command);
      } 
  }
  //LEFT,RIGHT,MOVE command can be  taken care using below method with new values without PLACE
  movingDecision(value){
    this.isMoved = true;
    this.state = value;
    const xyCoordinate = this.state;
    this.current_coordinate = xyCoordinate[1]+","+xyCoordinate[0];
    if(xyCoordinate[2]) this.robot_direction = "robot_"+ xyCoordinate[2].toLowerCase();
  }
  //LEFT,RIGHT,MOVE command methods
  moveRobot(value){
    this.show_data = false;
//to validate to initialize the PLACE first
    if(this.isMoved){
  
    let a = this.state;  
    //changing direction and storing data in array
    if(value=="LEFT" || value=="RIGHT"){
      a[2] = this.fetchDirection(a[2].toLowerCase(),value); 
      this.command_array.push(value); 
      this.movingDecision(a); 
    }else if(value=="MOVE"){
      switch (a[2].toLowerCase()) {
        case "east":
          if(parseInt(a[0]) + 1 > this.number-1){
            this.presentToast(this.ERRORS.wrong_moving_direction)
          }else{
            a[0]++;
            this.command_array.push(value);
            this.movingDecision(a);
          }    
        break;
        case "west":
          if(parseInt(a[0]) - 1 < 0){
            this.presentToast(this.ERRORS.wrong_moving_direction)
          }else{
            a[0]--;
            this.command_array.push(value);
            this.movingDecision(a);
          }
        break;
        case "south":
          if(parseInt(a[1]) - 1 < 0){
            this.presentToast(this.ERRORS.wrong_moving_direction)
          }else{
            a[1]--;
            this.command_array.push(value);
            this.movingDecision(a);
          }
        break;
        case "north":
          if(parseInt(a[1]) + 1 > this.number-1){
            this.presentToast(this.ERRORS.wrong_moving_direction)
          }else{
            a[1]++;
            this.command_array.push(value);
            this.movingDecision(a);
          }
        break;
        default:
          break;
      }

     
    }
  }else{
    this.presentToast(this.ERRORS.not_initialized);
  } 
  }
//show report
  showReport(){
    if(this.isMoved){
       this.show_data = true;
    }else{
      this.presentToast(this.ERRORS.not_initialized);
    }
  }
//fetching next direction if LEFT or RIGHT pressed
  fetchDirection(current_direction,input_direction){
      var a = ["north","east","south","west"];
      if(input_direction=="LEFT"){
       return current_direction=="north"? a[3] :  a[a.indexOf(current_direction) -1];
      }else{
        return current_direction=="west"?  a[0]:  a[a.indexOf(current_direction) +1] ;
      }
  }
//Toast to show error 
  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position:"top",
      buttons: [
       {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
  }
//Resetting board
  resetBoard(){
    this.inputValue = "";
    this.command_array = [];
    this.isMoved = false;
    this.current_coordinate = "0,0";
    this.show_data = false;
    this.state = [0,0,"east"];
    const xyCoordinate = this.state;
    this.current_coordinate = xyCoordinate[1]+","+xyCoordinate[0];
    if(xyCoordinate[2]) this.robot_direction = "robot_"+ xyCoordinate[2].toLowerCase();
  }




}
