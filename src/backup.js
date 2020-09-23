const base = require('./base');

function findBlock(hero, blocks) {
  let found = blocks.find((element) => {
    return (element.position[0] === hero.position[0] && element.position[1] === hero.position[1]);
  })
  return found;
}

class BaseLevel
{
  constructor(name)
  {
    this.name = name;
  }
}

class Level extends BaseLevel{
  constructor(name, blocks, hero, goal, goalState, restrictions, pointsForLevel) {
    
    super(name);
    let tmpBlocks = [];

    blocks.forEach(block => {
      if(block.color!='red' && block.color!='green' && block.color!='blue')
        tmpBlocks.push(new Block(block.position));
      else
        tmpBlocks.push(new Block(block.position, block.color));
    });
    
    this.blocks = tmpBlocks;
    this.hero = hero;
    this.goal = goal;
    
    this.pointsForLevel = pointsForLevel;

    this.counterOfFunctions = 0;
    this.counterOfCommands = 0;
    this.allowedCommands = restrictions.allowedCommands;
    this.maxNumberOfCommands = restrictions.numberOfCommands;
    this.maxNumberOfFunctions = restrictions.numberOfFunctions;

    
    //if goalState is to reach last block
    if(goalState instanceof Block)  
      this.lastBlock = goalState;
    else
    {
      this.stars = goalState;
      this.stars.forEach((element) => {
        element.isEaten = false;
      })
      this.numberOfStars = goalState.length
    }
  }

  //function to create and return objects of command
  getCommand(element, tmpArray, myfunction, functions)
  {
    ++this.counterOfCommands;
    if(this.counterOfCommands > this.maxNumberOfCommands)
      throw 'reached maximum possible number of commands';

    if(this.allowedCommands.includes(element.name)){
      switch(element.name){
        case 'step':
          return new StepCommand();
        case 'left':
          return new TurnLeftCommand();
        case 'right':
          return new TurnRightCommand();
        case 'paint':
          return new PaintCommand(element.color);
        case 'if':
          return new IfCommand(element.color, this.getCommand(element.command, tmpArray, myfunction, functions)); 
        case 'loop':
          
          element.commands.forEach((data)=>{
            
            let newtmpArray = [];

            if(data.name == 'loop'){
              tmpArray.push(this.getCommand(data, newtmpArray, myfunction, functions));
            }
            else
              tmpArray.push(this.getCommand(data, tmpArray, myfunction, functions));
          
          })

          return new LoopCommand(element.iterations, tmpArray);
        
        case 'call function':
          
          let found = functions.find((functionToCall) => {
            return (element.functionName === functionToCall.name);
          })

          return new CallFunctionCommand(found, element.name);

        case 'recursion':
          return new CallFunctionCommand(myfunction, element.name);
      }
    }
  }


  createFunction(name)
  {
    ++this.counterOfFunctions;
    if(this.counterOfFunctions > this.maxNumberOfFunctions)
      throw 'reached maximum possible number of functions'

    return new CustomFunction(name);
  }

  pushToCustomFunction(customfunction, element, tmpObject, functions) //array or some custom function
  {
      customfunction.push(this.getCommand(element, tmpObject, customfunction, functions));
  }


  checkBounds()   //returns false if hero is out of bounds
  {
    if (!findBlock(this.hero, this.blocks))
      return false
    return true;
  }

  checkGoal()  //return false if hero did not reached the goal 
  {
    // return this.goal.checkGoal(this.hero);
    switch (this.goal) {
      case "collectStars":
  
        //search for star in stars array
        let tempBlock = findBlock(this.hero, this.stars);
        if (tempBlock && tempBlock.isEaten == false) {
          tempBlock.isEaten = true;
          --this.numberOfStars;createFunction
        }
  
        //returns true if all stars are achieved
        if (this.numberOfStars == 0)
          return true;
        return false;

      case "reachPoint":
        if (this.hero.position[0] == this.lastBlock.position[0] && this.hero.position[1] == this.lastBlock.position[1]){
          return true;
        }
        return false;
    }
  }
}


class Hero {
  constructor([x,y], direction) {
    this.position = [x,y]
    this.direction = direction;
  }
}

class Block {
  constructor([x, y], color = 'white') {
    this.color = color;
    this.position = [x, y]
  }
}

//for example F1, F2 and so on, commands is array
class CustomFunction {
  constructor(name, commands=[]) {
    this.name = name;
    this.commands = commands;
  }

  push(command)
  {
    this.commands.push(command);
  }
}

// abstract like class
class Command { 

  //default constructor
  constructor(name) {  
    this.name = name;
  }
  
  //default function to be overridden
  execute() {  

  }
}

class TurnRightCommand extends Command {
  constructor(name = 'right')
  {
    super(name)
  } 
  execute(level) {

    if (level.hero.direction < 3)
      ++level.hero.direction;
    else
      level.hero.direction = 0;

  }

}

class TurnLeftCommand extends Command {
  constructor(name = 'left')
  {
    super(name)
  }  
  execute(level) {
    if (level.hero.direction > 0)
      --level.hero.direction;
    else
      level.hero.direction = 3;

  }
}

class StepCommand extends Command {
  constructor(name = 'step')
  {
    super(name)
  }
  execute(level) {
    switch (level.hero.direction) {
      case 0:
        ++level.hero.position[1];
        break;
      case 1:
        ++level.hero.position[0];
        break;
      case 2:
        --level.hero.position[1];
        break;
      case 3:
        --level.hero.position[0];
        break;
    }
    // console.log('x : ' + level.hero.position[0]+ '  y : ' + level.hero.position[1] + '   direction :' + level.hero.direction);
  }

}

class PaintCommand extends Command {
  constructor(color = 'white', name = "paint") {
    super(name);
    this.color = color;
  }

  //new color is in command object
  execute(level) {

    findBlock(level.hero, level.blocks).color = this.color;

  }

}

// for loop command
class LoopCommand extends Command {
  constructor(iterations = 1, commands = [], name = "loop") {
    super(name);
    if(iterations > 1000)
      throw 'too much iterations'

    this.iterations = iterations;
    this.commands = commands;
      }

  //implementation of loop
  execute(level) {

    // iteration through loop
    for (let i = 0; i < this.iterations; ++i) {

      //iteration through array of loop commands
      for (let j = 0; j < this.commands.length; ++j) {

        // executing the j command
        this.commands[j].execute(level);

        //check whether hero is out of bounds
        if (!level.checkBounds())
          return;

        // check the goal of level
        if (level.checkGoal())
          return;
      }
    }
  }
}

class IfCommand extends Command {
  constructor(color, command, name = 'if') {
    //initialize move if statement is true
    super(name);
    this.color = color;
    this.command = command;
  }

  execute(level) {

    let tempBlock = findBlock(level.hero, level.blocks);

    if (tempBlock.color == this.color) {
      this.command.execute(level);
    }

  }
}

//in order to implement recursion and call other functions
class CallFunctionCommand extends Command { 
  
  constructor(CustomFunction, name = 'call function') {
    super(name);
    this.CustomFunction = CustomFunction;
   
    this.counterOfRecursion = 0;
    this.maxNumberOfRecursionCalls = 10;
 
  }

  //calling some functions, for example main functions
  execute(level){
    
    ++this.counterOfRecursion;
    if(this.counterOfRecursion > this.maxNumberOfRecursionCalls)
      throw 'stack overflow'

    for (let i = 0; i < this.CustomFunction.commands.length; ++i) {
      this.CustomFunction.commands[i].execute(level);

 	//check wheter hero is in bounds or not
      if (!level.checkBounds()) {
        // console.log('hero is out of bounds');
        return false;
      }

    //check wheter hero reached goal or not
      if (level.checkGoal()) {
        // console.log('the goal is reached');
        // console.log(level.goal);
        return true;
      }

    }
    // console.log('hero did not reached the goal')
    return false;
  }
}


class Game {
  constructor(level, mainFunction) {
    this.level = level;
    this.functionCall = new CallFunctionCommand(mainFunction, "call main")
  }

  //this function has to return either true or false
  check() {

    return this.functionCall.execute(this.level);

  }

}


export {
Level,
Block,
Game,
Hero
}
