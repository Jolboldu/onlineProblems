const base = require('../src/base');

class Level extends base.BaseLevel{
  constructor(name, blocks, hero, stars, restrictions, pointsForLevel){
    super(name,blocks, hero, stars);

    this.pointsForLevel = pointsForLevel;

    this.counterOfFunctions = 0;
    this.counterOfCommands = 0;
    this.allowedCommands = restrictions.allowedCommands;
    if(this.allowedCommands.includes('recursion'))
      this.allowedCommands.push('call function')
    
    this.maxNumberOfCommands = 0;
    restrictions.numberOfCommandsInFunction.forEach(element => {
      this.maxNumberOfCommands += element;
    });
    
    if(this.maxNumberOfCommands == 0)
      this.maxNumberOfCommands = restrictions.numberOfCommands;


    this.maxNumberOfFunctions = restrictions.numberOfFunctions;
    this.numberOfCommandsInFunction = restrictions.numberOfCommandsInFunction;
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
          return new base.BaseStepCommand();
        case 'left':
          return new base.BaseTurnLeftCommand();
        case 'right':
          return new base.BaseTurnRightCommand();
        case 'paint':
          return new base.BasePaintCommand(element.color);
        case 'if':
          --this.counterOfCommands;
          return new base.BaseIfCommand(element.color, this.getCommand(element.command, tmpArray, myfunction, functions)); 
        case 'loop':
          
          element.commands.forEach((data)=>{
            
            let newtmpArray = [];

            if(data.name == 'loop'){
              tmpArray.push(this.getCommand(data, newtmpArray, myfunction, functions));
            }
            else
              tmpArray.push(this.getCommand(data, tmpArray, myfunction, functions));
          
          })

          return new base.BaseLoopCommand(element.iterations, tmpArray);
        includes
        case 'call function':
          // console.log('function check');
          // console.log(functions);
          
          let found = functions.find((functionToCall) => {
            return (element.functionName === functionToCall.name);
          })

          return new base.BaseCallFunctionCommand(found, element.name);

        case 'recursion':
          return new base.BaseCallFunctionCommand(myfunction, element.name);
      }
    }
  }


  createFunction(name)
  {
    ++this.counterOfFunctions;
    if(this.counterOfFunctions > this.maxNumberOfFunctions)
      throw 'reached maximum possible number of functions'

    return new CustomFunction(name, this.numberOfCommandsInFunction[this.counterOfFunctions - 1]);
  }

  pushToCustomFunction(customfunction, element, tmpObject, functions) //array or some custom function
  {
      customfunction.push(this.getCommand(element, tmpObject, customfunction, functions));
  }
}


//for example F1, F2 and so on, commands is array
class CustomFunction {
  constructor(name, maxNumberOfCommandsInFunction, commands=[]) {
    this.name = name;
    this.maxNumberOfCommandsInFunction = maxNumberOfCommandsInFunction;

    if(this.maxNumberOfCommandsInFunction){
      if(commands.length > this.maxNumberOfCommandsInFunction)
        throw 'reached maximum possible number of commands in function';
    }
    this.commands = commands;
  }

  push(command)
  {
    if(this.maxNumberOfCommandsInFunction){ 
      if(this.commands.length + 1 > this.maxNumberOfCommandsInFunction)
        throw 'reached maximum possible number of commands in function';
    }
    this.commands.push(command);
  }
}


class Game {
  constructor(level, mainFunction) {
    this.level = level;
    this.functionCall = new base.BaseCallFunctionCommand(mainFunction, "call main")
  }

  //this function has to return either true or false
  check() {
    return this.functionCall.execute(this.level);

  }

}


export {
Level,
Game
}
