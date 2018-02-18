registerPlugin({
    name: 'OK_lib',
    engine: '>= 0.13.37',
    version: '0.1',
    description: 'A lib that is OK. For other scripts to use.',
    author: 'Diesmon <dontmindme12@web.de> & Tuetchen || Smorrebrod || Cedrik <cedrik.paetz@gmail.com>',
    vars: [
        {
            name: 'logLevel',
            title: 'Sets a global debug log level for all scripts that use this lib. The logs will be displayed in the instance logs.',
            type: 'select',
            options: ['1','2','3','4','5','6','7','8','9','10']
        }
    ]

}, function(sinusbot, config) {

    var event = require('event');
    var engine = require('engine');
    var store = require('store');
    var backend = require('backend');
    var media = require('media');
    var audio = require('audio');
    var format = require('format');
    var helper = require('helpers');

    var ts = false;
    if(engine.getBackend() == "ts3"){
        ts = true;
    }

    engine.notify('OK_lib loaded');

    /*
        General
    */
    /**
    * A chat hook for the native SinusBot !info && !help commands.
    **/
    event.on('chat', function(ev) {
        if (ev.text == "!info" || "!help"){
            ev.client.chat("This bot uses the [Muss URL werden]OK_lib[/Muss URL werden], which is a libary for basic script functions.");  //URLReminder
        }
    });

    /**
    * Logs a message to the Instance Log.
    *
    * @param {string} message The Log Message.
    * @param {number} logLevel The Log Level of this Log Message.
    **/
    function log(message, logLevel){
        engine.log("Loglevel im log func: " + logLevel)
        engine.log("config.Loglevel im log func: " + config.logLevel)
        if (logLevel-1 <= config.logLevel){
            engine.log(message);
        }
    }

  	/*
  		Channel
  	*/

  	/**
    * Returns a List of all Channels matching the Name
    *
    * @param {String} channelName The Channels Name.
    * @returns {Channel[]} The List of all Channels matching the given Name.
    **/
  	function channelGetChannelByName(channelName){
        var result = [];
        var channels = backend.getChannels();
        for (var channel in channels){
        	if (channels[channel].name() == channelName){
              	result.push(channels[channel]);
            }
        }
        return result;
    }

  	/**
    * Returns the Channel with the matching Name and the matching Parent Channel.
    *
    * @param {String} channelName The Channels Name.
    * @param {number} parentID The Channel ID of the Parent.
    * @returns {Channel} The matching Channel or null.
    **/
  	function channelGetChannelByNameAndParent(channelName, parentID){
        var channels = backend.getChannels();
        for (var channel in channels){
        	if (channels[channel].name() == channelName && channels[channel].parent() && channels[channel].parent().id() == parentID){
              	return channels[channel];
            }
        }
        return null;
    }

    function channelGetSubstractedUserlist(channel, userlist){
        var result = channel.getClients();
        if(userlist.length !== 0){
            if(typeof(userlist[0]) === "string"){
                for(var userS in userlist){
                    if(objectFunctionContainsElement(result, "uid", userlist[userS])){
                        result = arrayRemoveElement(result, backend.getClientByUID(userlist[userS]));
                        log("Spliced user string: " + userlist[userS], 10);
                    }
                }
            }
            else if(typeof(userlist[0]) === "object"){
                for(var userO in userlist){
                    if(arrayContainsElement(result, userlist[userO])){
                        result = arraySpliceElement(result, userlist[userO]);
                        log("Spliced user object: " + userlist[userO], 10);
                    }
                }
            }
            return result;
        }
        return result;
    }

    /*
        Client
    */

    /**
    * Checks if a Client is the Member of all Server Groups.
    *
    * @param {Client} client The tested Client as a Client Object.
    * @param {number[]} checkGroups The Groups that should be checked as an Array of GroupIDs.
    * @returns {boolean} True if the Client is in all Groups, else False.
    **/
    function clientServerGroupsIsMemberOfAll(client, checkGroups){
        var serverGroups = serverGroupParseIDs(client.getServerGroups());
        return arrayContainsAll(serverGroups, checkGroups);
    }

    /**
    * Checks if a Client is the Member of one of the Server Groups.
    *
    * @param {Client} client The tested Client as a Client Object.
    * @param {number[]} checkGroups The Groups that should be checked as an Array of GroupIDs.
    * @returns {boolean} True if the Client is in one Group, else False.
    **/
    function clientServerGroupsIsMemberOfOne(client, checkGroups){
        var serverGroups = serverGroupParseIDs(client.getServerGroups());
        return arrayContainsOne(serverGroups, checkGroups);
    }

    /**
    * Checks if a Client is the Member of a Server Group.
    *
    * @param {Client} client The tested Client as a Client Object.
    * @param {number} checkGroups The GroupID of the Group that should be checked.
    * @returns {boolean} True if the Client is Member of the Server Group, else False.
    **/
    function clientServerGroupsIsMemberOf(client, checkGroup){
        var serverGroups = serverGroupParseIDs(client.getServerGroups());
        return arrayContainsElement(serverGroups, checkGroup);
    }

    /**
    * Checks if a Client is the Member of some Server Groups.
    *
    * @param {Client} client The tested Client as a Client Object.
    * @param {number[]} checkGroups The Groups that should be checked as an Array of GroupIDs.
    * @returns {object} Contains two arrays with GroupID's, the first with GroupID's in which the client is and the second in which the client is not.
    **/
    /*function clientServerGroupsIsMemberaAndIsNotMember(client, checkGroup){
        var isMember = [];
        var isNotMember = [];
        var memberAndNotMember = {memberOf: isMember, notMemberOf: isNotMember};
        var serverGroups = client.getServerGroups();
        for (var serverGroup in serverGroups){
            if (clientServerGroupsIsMemberOf(client, serverGroups[serverGroup].id())){
                isMember.push(serverGroups[serverGroup].id());
            }
            else {
                isNotMember.push(serverGroups[serverGroup].id());
            }
        }
        return memberAndNotMember;
    }*/

	/**
    * Searches all clients name maches and returns matches as a array object.
    *
    * @param {string} searchString The tested Client as a Client Object.
    * @param {boolean} caseSensitive A optional flag to let the searcher know if the string should be treated as Case-sensitive when it is set to true or Case-insensitive when it is set to false.
    * @returns {Client[]} Array of clients that match the search string.
    **/
    function clientSearchByName(searchString, caseSensitive){
      	var matches = [];
      	var clients = backend.getClients();
      	for(var client in clients){
          	if(caseSensitive && clients[client].name().indexOf(searchString) !== -1){
                matches.push(clients[client]);
            }else if(!caseSensitive && clients[client].name().toLowerCase().indexOf(searchString.toLowerCase()) !== -1){
              	matches.push(clients[client]);
            }
        }
        return matches;
    }

  	/*
    	Strings
    */

  	/**
    * Returns the UID from a UID/ID/Name
    *
    * @param {string} stringToParse The string for parsing into a UID.
    * @param {boolean} caseSensitive A optional boolean flag to let the parser know if the string should be treated as Case-sensitive when it is set to true or Case-insensitive when it is set to false.
    * @returns {Client} returns the client object or null depending if a client was found or not.
    **/
    function getClient(stringToParse, caseSensitive){
        var clients = backend.getClients();
        for(var client in clients){
            if(!caseSensitive && clients[client].name().toLowerCase() == stringToParse.toLowerCase()){
                return clients[client];
            }
            else if(caseSensitive && clients[client].name() == stringToParse){
                return clients[client];
            }
          	else if(clients[client].uid() == stringToParse){
                return clients[client];
            }
            else if(clients[client].id() == stringToParse){
                return clients[client];
            }
        }
        return null;
    }

    /*
        Group
    */

    function serverGroupParseIDs(serverGroups){
        serverGroups = arrayCreateArray(serverGroups);
        if (isNumber(serverGroups[0])){
            return serverGroups;
        }
        var result = [];
        for (var serverGroup in serverGroups){
            result.push(serverGroups[serverGroup].id());
        }
        return result;
    }

    function clientServerGroupAddToGroup(client, groups){
        groups = arrayCreateArray(groups);
        if (groups.length > 0){
            for (var curGroup in groups){
                if (!clientServerGroupsIsMemberOf(client, groups[curGroup])){
                    var groupChecker = backend.getServerGroupByID(groups[curGroup]);
                    if (groupChecker){
                        client.addToServerGroup(groupChecker);
                    }
                    else {
                        log("Group wasn't added. Reason: Group ID " + groups[curGroup] + " was not found on the server", 3);
                    }
                }
                else {
                    log("Group wasn't added. Reason: The client already got the Group ID " + groups[curGroup], 5);
                }
            }
        }
    }

    function clientServerGroupRemoveFromGroup(client, groups){
        groups = arrayCreateArray(groups);
        if (groups.length > 0){
            for (var curGroup in groups){
                if (clientServerGroupsIsMemberOf(client, groups[curGroup])){
                    client.removeFromServerGroup(groups[curGroup]);
                }
                else {
                    log("Group wasn't removed. Reason: The client does not have the Group ID " + groups[curGroup], 5);
                }
            }
        }
    }

    /*
        Helper
    */

    function arrayDifference(array, elements){
        var result = [];
        for (var element in elements){
            if (!arrayContainsElement(array, elements[element])){
                result.push(elements[element]);
            }
        }
        for (var arrayElement in array){
            if (!arrayContainsElement(elements, array[arrayElement])){
                result.push(array[arrayElement]);
            }
        }
        return result;
    }

    function arrayMissingElements(array, elements){
        elements = arrayCreateArray(elements);
        var result = [];
        for (var element in elements){
            if (!arrayContainsElement(array, elements[element])){
                result.push(elements[element]);
            }
        }
        return result;
    }

    function arrayContainsAll(array, elements){
        if (arrayMissingElements(array, elements).length > 0){
            return true;
        }else{
            return false;
        }
    }

    function arrayContainsOne(array, elements){
        for (var element in elements){
            if (arrayContainsElement(array, elements[element])){
                return true;
            }
        }
        return false;
    }

    function arrayContainsElement(array, element){
        for (var arrayElement in array){
            if (array[arrayElement] == element){
                return true;
            }
        }
        return false;
    }

    function arrayObjectContainsElement(array, object, element){
        for (var arrayElement in array){
            if (array[arrayElement][object] == element){
                return true;
            }
        }
        return false;
    }

    function arrayRemoveElement(array, element){
        var result = [];
        if (!arrayContainsElement(array, element)){
            result.push(array[arrayElement]);
        }
        return result;
    }

    function arrayCreateArray(element){
        if (!Array.isArray(element)){
            var array = [];
            array.push(element);
            return array;
        }
        else{
            return element;
        }
    }

    function objectFunctionContainsElement(array, object, element){
        for (var arrayElement in array){
            if (array[arrayElement][object]() == element){
                return true;
            }
        }
        return false;
    }

    function isNumber(number){
        if (!isNaN(number)){
            return true;
        }
        return false;
    }

    /*
        Lib Definition
    */

    var libModule = {
        general: {
            log: log
        },
        client: {
            serverGroups: {
                isMemberOf: clientServerGroupsIsMemberOf,
                isMemberOfAll: clientServerGroupsIsMemberOfAll,
                isMemberOfOne: clientServerGroupsIsMemberOfOne,
                addGroups: clientServerGroupAddToGroup,
                removeGroups: clientServerGroupRemoveFromGroup,
            },
            get: getClient,
            getByName: clientSearchByName,
        },
        serverGroups: {
            getIDs: serverGroupParseIDs,
        },
        channel: {
            getByName: channelGetChannelByName,
            getByNameParent: channelGetChannelByNameAndParent,
            getSubstractedUserlist: channelGetSubstractedUserlist,
        },
        chat: {

        },
        helper: {
            arrayDifference: arrayDifference,
            arrayMissingElements: arrayMissingElements,
            arrayContainsAll: arrayContainsAll,
            arrayContainsOne: arrayContainsOne,
            arrayContainsElement: arrayContainsElement,
            arrayObjectContainsElement: arrayObjectContainsElement,
            isNumber: isNumber,
            createArray: arrayCreateArray
        }
    };


    engine.export(libModule);
});
