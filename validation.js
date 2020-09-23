var validator = require('validator');


function IsPhoneNumber(phoneNumber)
{
	if(phoneNumber === undefined)
		return false;

    if(phoneNumber.length != 13)
        return false;

    if(phoneNumber.charAt(0) != '+')
        return false;

    if(!validator.isNumeric(phoneNumber.substring(1, phoneNumber.length)))
        return false;

    return true;
}


function isEmail(email)
{
	return validator.isEmail(email);
}

function isValidPassword(password)
{
	if(password == undefined)
		return false;

	let isUppercase = false;
	let isLowercase = false;
	let isOneNumber = false;

	if(password.length < 8)
		return false;

	if(!validator.isAscii(password))
		return false;
	
	for(let i = 0; i < password.length; i++)
	{
		if(validator.isUppercase(password.charAt(i)))
			isUppercase = true;

		if(validator.isLowercase(password.charAt(i)))
			isLowercase = true;
	
		if(validator.isNumeric(password.charAt(i)))
			isOneNumber = true;
	}

	
	return isUppercase && isLowercase && isOneNumber;
}

function IsValidLevelData(body)
{	
	if(body.name === undefined)
		return false;

    if(body.blocks === undefined)
        return false;


    if(body.hero === undefined)
        return false;

    if(body.stars === undefined)
        return false;

    if(body.restrictions === undefined)
        return false;

    if(body.pointsForLevel === undefined)
        return false;

    if(body.stageId === undefined)
        return false;

    return true;
}

function isValidSubmitData(body)
{	
	if(body.functions === undefined)
		return false;

    if(body.levelId === undefined)
        return false;


    if(body.solvingTime === undefined)
        return false;

    return true;
}

function isValidStatsScrollData(body)
{
	if(body.knownIds === undefined || body.knownIds.length == 0)
		return false;

    if(body.delta === undefined)
        return false;


    if(body.ratingOfLast === undefined || body.ratingOfLast <= 0)
        return false;

    return true;
}

function isValidStageData(body)
{
	
}
module.exports = {
	IsPhoneNumber,
	isValidPassword,
	isEmail,
	IsValidLevelData,
	isValidSubmitData,
	isValidStatsScrollData
}