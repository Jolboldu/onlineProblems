
function findBlock(hero, blocks) {
  let found = blocks.find((element) => {
    return (element.position[0] === hero.position[0] && element.position[1] === hero.position[1]);
  })
  return found;
}

class BaseLevel
{
  constructor(name, blocks, hero, stars) 
  {

    this.name = name;
    let tmpBlocks = [];

    blocks.forEach(block => {
      if(block.color!='red' && block.color!='green' && block.color!='blue')
        tmpBlocks.push(new BaseBlock(block.position));
      else
        tmpBlocks.push(new BaseBlock(block.position, block.color));
    });
    
    this.blocks = tmpBlocks;
    this.hero = hero;
    
    //if goalState is to reach last block
      this.stars = stars;
      this.stars.forEach((element) => {
        element.isEaten = false;
      })
      this.numberOfStars = this.stars.length
  }

  checkBounds()   //returns false if hero is out of bounds
  {
    if (!findBlock(this.hero, this.blocks))
      return false
    return true;
  }

  checkGoal()  //return false if hero did not reached the goal 
  {
  
        //search for star in stars array
        let tempBlock = findBlock(this.hero, this.stars);
        if (tempBlock && tempBlock.isEaten == false) {
          tempBlock.isEaten = true;
          --this.numberOfStars;
        }
  
        //returns true if all stars are achieved
        if (this.numberOfStars == 0)
          return true;
        return false;
  }
}


class BaseHero {
  constructor([x,y], direction) {
    this.position = [x,y]
    this.direction = direction;
  }
}

class BaseBlock {
  constructor([x, y], color = 'white') {
    this.color = color;
    this.position = [x, y]
  }
}

//for example F1, F2 and so on, commands is array
class BaseCustomFunction {
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
class BaseCommand { 

  //default constructor
  constructor(name) {  
    this.name = name;
  }
  
  //default function to be overridden
  execute() {  

  }
}

class BaseTurnRightCommand extends BaseCommand {
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

class BaseTurnLeftCommand extends BaseCommand {
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

class BaseStepCommand extends BaseCommand {
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

  }

}

class BasePaintCommand extends BaseCommand {
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
class BaseLoopCommand extends BaseCommand {
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

class BaseIfCommand extends BaseCommand {
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
class BaseCallFunctionCommand extends BaseCommand { 
  
  constructor(CustomFunction, name = 'call function') {
    super(name);
    this.CustomFunction = CustomFunction;
   
    this.counterOfRecursion = 0;
    this.maxNumberOfRecursionCalls = 1000;
 
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
        return false;
      }

    //check wheter hero reached goal or not
      if (level.checkGoal()) {
        
        return true;
      }

    }
    return false;
  }
}

module.exports = {
  BaseLevel,
  BaseBlock,
  BaseHero,
  BaseStepCommand,
  BaseTurnLeftCommand,
  BaseTurnRightCommand,
  BasePaintCommand,
  BaseIfCommand,
  BaseLoopCommand,
  BaseCustomFunction,
  BaseCallFunctionCommand,
}
