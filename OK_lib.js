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
            options: ['1 - Critical','2 - Error','3 - Nothing found','4 - Light debug','5 - Full debug']
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

    engine.notify('OK_lib loaded');

    var ts = false;
    if(engine.getBackend() == "ts3"){
        ts = true;
    }

    var activeBotInstances = [];
    engine.on('load', function() {
        event.broadcast('OKlib_register_instance', {botclient: backend.getBotClient()});
    });

    event.on('OKlib_register_instance', function(ev){
        if(!arrayContainsElement(activeBotInstances, ev.botclient, equalClientObjects)){
            activeBotInstances.push(ev.botclient);
        }
    });

    event.on('disconnect', function(){
        event.broadcast('OKlib_unregister_instance', {botclient: backend.getBotClient()});
    });

    event.on('OKlib_unregister_instance', function(ev){
        activeBotInstances = arrayRemoveElements(activeBotInstances, ev.botclient, equalClientObjects);
    });

    /*
        General
    */
    /**
    * A chat hook for the native SinusBot !info && !help commands.
    **/
    event.on('chat', function(ev) {
        if (ev.text == "!info" || "!help"){
            ev.client.chat("This bot uses the OK_lib, which is a libary for basic script functions.");
        }
    });

    /**
    * Logs a message to the Instance Log.
    *
    * @param {string} message The Log Message.
    * @param {number} logLevel The Log Level of this Log Message.
    **/
    function log(message, logLevel){
        if (config.logLevel >= 0){
            if (logLevel-1 <= config.logLevel){
                engine.log(message);
            }
        }
    }

    function getActiveBotInstances(){
        return activeBotInstances;
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

    /*
        Client
    */

    function equalClientObjects(firstClient, secondClient){
        return firstClient.equals(secondClient);
    }

    function clientParseUIDs(clients){
        clients = arrayCreateArray(clients);
        var result = [];
        for (var client in clients){
            result.push(clients[client].uid());
            log("clientsParseUIDs: Resolved UID '" + clients[client].uid() + "'", 50);
        }
      	log("clientsParseUIDs: Results found: '" + result.length + "'", 4);
        return result;
    }

    function clientParseClients(UIDs){
        UIDs = arrayCreateArray(UIDs);
        var result = [];
        for (var curUID in UIDs){
          	var client = backend.getClientByUID(UIDs[curUID]);
          	if(client){
            	result.push(client);
            	log("clientsParseClient: Resolved UID '" + UIDs[curUID] + "' to '" + JSON.stringify(client) + "'", 5);
            }
          	else{
              	log("clientsParseClient: A client with the UID '" + UIDs[curUID] + "' could not be found on the server", 3);
            }
        }
        return result;
    }

    /**
    * Returns the result between the two sets of clientlists.
    *
    * @param {String} channelName The Channels Name.
    * @param {number} parentID The Channel ID of the Parent.
    * @returns {Channel} The matching Channel or null.
    **/
    /*function clientSubstraction(originlist, substractlist){
      	originlist = arrayCreateArray(originlist);
      	substractlist = arrayCreateArray(substractlist);
        var result = [];
        for(var clientS in substractlist){
            for(var clientO in originlist){
                if(!equalClientObjects(originlist[clientO], substractlist[clientS])){
                    result.push(originlist[clientO]);
                    log("clientSubstraction: The client '" + JSON.stringify(originlist[clientO]) + "' is part of the resultlist", 5);
                }
            }
        }
        log("clientSubstraction: Results found: '" + result.length + "'", 4);
        return result;
    }*/
    function clientRemoveClients(listone, listtwo){
        return arrayRemoveElements(listone, listtwo, equalClientObjects);
    }

    /**
    * Returns a client by a full or part name match or by a UID or ID match
    *
    * @param {string} stringToParse The string to compare the clients attributes with.
    * @param {boolean} partMatch A flag if the part matches should also count as match (Beware: first triggered partMatch will return the client)
    * @param {boolean} caseSensitive A optional boolean flag to let the parser know if the string should be treated as Case-sensitive when it is set to true or Case-insensitive when it is set to false.
    * @returns {Client} returns the client object or null depending if a client was found or not.
    **/
    function clientSearchByAll(stringToParse, partMatch, caseSensitive){
        var clients = backend.getClients();
      	if(caseSensitive){
          	stringToParse = stringToParse.toLowerCase();
        }
      	var compare = equal;
      	if (partMatch){
          	compare = function(name, string){
              	return name.indexOf(string) != -1;
            };
        }
        for(var client in clients){
          	clientName = clients[client].name();
          	if(caseSensitive){
              	clientName = clientName.toLowerCase();
            }
          	if(compare(clientName, stringToParse)){
                log("clientSearchByAll: Found a name match between '" + stringToParse + "' and '" + JSON.stringify(clients[client]) + "'", 5);
          		return clients[client];
            }
      		else if(clients[client].uid() == stringToParse){
                log("clientSearchByAll: Found a UID match between '" + stringToParse + "' and '" + JSON.stringify(clients[client]) + "'", 5);
                return clients[client];
            }
            else if(clients[client].id() == stringToParse){
                log("clientSearchByAll: Found a ID match between '" + stringToParse + "' and '" + JSON.stringify(clients[client]) + "'", 5);
                return clients[client];
            }
        }
      	log("clientsSearchByAll: No result found", 4);
        return null;
    }

	/**
    * Returns a array of clients by a full or part name match or by a UID or ID match
    *
    * @param {string} stringToParse The string to compare the clients attributes with.
    * @param {boolean} partMatch A flag if the part matches should also count as match (Beware: first triggered partMatch will return the client)
    * @param {boolean} caseSensitive A optional boolean flag to let the parser know if the string should be treated as Case-sensitive when it is set to true or Case-insensitive when it is set to false.
    * @returns {Array} returns a array filled with client matches.
    **/
	function clientsSearchByAll(stringToParse, partMatch, caseSensitive){
        var clients = backend.getClients();
      	var result = [];
      	if(caseSensitive){
          	stringToParse = stringToParse.toLowerCase();
        }
      	var compare = equal;
      	if (partMatch){
          	compare = function(name, string){
              	return name.indexOf(string) != -1;
            };
        }
      	for(var client in clients){
          	clientName = clients[client].name();
          	if(caseSensitive){
              	clientName = clientName.toLowerCase();
            }
          	if(compare(clientName, stringToParse)){
                result.push(clients[client]);
                log("clientsSearchByAll: Found a part match between '" + stringToParse + "' and '" + JSON.stringify(clients[client]) + "'", 5);
            }
            else if(clients[client].uid() == stringToParse){
                result.push(clients[client]);
                log("clientsSearchByAll: Found a UID match between '" + stringToParse + "' and '" + JSON.stringify(clients[client]) + "'", 5);
            }
            else if(clients[client].id() == stringToParse){
                result.push(clients[client]);
                log("clientsSearchByAll: Found a ID match between '" + stringToParse + "' and '" + JSON.stringify(clients[client]) + "'", 5);
            }
        }
      	if(result.length == 0){
        	log("clientsSearchByAll: Results found: '" + result.length + "'", 4);
        }
        return result;
    }

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

    function clientServerGroupAddToGroup(client, groups){
        groups = arrayCreateArray(groups);
        if (groups.length > 0){
            for (var curGroup in groups){
                if (!clientServerGroupsIsMemberOf(client, groups[curGroup])){
                    var group = backend.getServerGroupByID(groups[curGroup]);
                    if (group){
                        client.addToServerGroup(group);
                      	log("clientServerGroupAddToGroup: The '" + JSON.stringify(client) + "' was added to the servergroup: '" + JSON.stringify(group) + "'", 5);
                    }
                    else {
                        log("clientServerGroupAddToGroup: A servergroup with the ID '" + groups[curGroup] + "' was not found on the server", 2);
                    }
                }
                else {
                    log("clientServerGroupAddToGroup: The '" + JSON.stringify(client) + "' already has the servergroup with the ID '" + groups[curGroup] + "'", 3);
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
                  	log("clientServerGroupRemoveFromGroup: '" + JSON.stringify(client) + "' was removed from the servergroup: '" + JSON.stringify(groups[curGroup]) +"'", 5);
                }
                else {
                    log("clientServerGroupRemoveFromGroup: '" + JSON.stringify(client) + "' did not had the group with the ID '" + groups[curGroup] + "'", 5);
                }
            }
        }
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
    /*function clientSearchByName(searchString, caseSensitive){
      	var matches = [];
      	var clients = backend.getClients();
      	for(var client in clients){
          	if(!caseSensitive && clients[client].name().toLowerCase().indexOf(searchString.toLowerCase()) !== -1){
                matches.push(clients[client]);
              	log("clientSearchByName: Found a case ignoring match between '" + searchString + "' and '" + JSON.stringify(clients[client]) + "'", 5);
            }else if(caseSensitive && clients[client].name().indexOf(searchString) !== -1){
              	matches.push(clients[client]);
              	log("clientSearchByName: Found a match between '" + searchString + "' and '" + JSON.stringify(clients[client]) + "'", 5);
            }
        }
        return matches;
    }*/

  	/*
    	Strings
    */

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
          	log("serverGroupParseIDs: Resolved the servergroup '" + JSON.stringify(serverGroups[serverGroup]) + "' to the ID '" + serverGroups[serverGroup].id() + "'", 5);
        }
        return result;
    }

    function serverGroupParseGroups(groupIDs){
        groupIDs = arrayCreateArray(groupIDs);
        if (!isNumber(groupIDs[0])){
            return groupIDs;
        }
        var result = [];
        for (var curID in groupIDs){
          	var group = backend.getServerGroupByID(groupIDs[curID]);
            if (group){
                result.push(group);
                log("serverGroupParseGroups: Resolved the ID '" + groupIDs[curID] + "' to the servergroup '" + JSON.stringify(group) + "'", 5);
            }
          	else{
              	log("serverGroupParseGroups: A servergroup with the ID '" + groupIDs[curID] + "' was not found on the server", 2);
            }
        }
        return result;
    }

    /*
        Helper
    */

    function arrayContainsAll(array, elements, compare){
        if (arrayMissingElements(array, elements, compare).length > 0){
            return true;
        }else{
            return false;
        }
    }

    function arrayCombineArrays(array, elements){
        array = arrayCreateArray(array);
        elements = arrayCreateArray(elements);
        var result = [];
        for(var arrayElement in array){
            result.push(array[arrayElement]);
            log("arrayCombineArrays: Added client '" + array[arrayElement] + "' from the first array into the combined one'", 5);
        }
        for(var element in elements){
            result.push(elements[element]);
            log("arrayCombineArrays: Added client '"+ elements[element] + "' from the second array into the combined one'", 5);
        }
        log("arrayCombineArrays: The combined result has '" + result.length + "' entries now", 4);
        return result;
    }

    function arrayContainsElement(array, element, compare){
      	if (!compare){
          	compare = equal;
        }
        for (var arrayElement in array){
            if (compare(array[arrayElement], element)){
                return true;
            }
        }
        return false;
    }

    function arrayContainsOne(array, elements, compare){
        for (var element in elements){
            if (arrayContainsElement(array, elements[element], compare)){
                return true;
            }
        }
        return false;
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

    function arrayDifference(array, elements, compare){
        var result = [];
        for (var element in elements){
            if (!arrayContainsElement(array, elements[element], compare)){
                result.push(elements[element]);
                log("arrayDifference: Added '" + elements[element].name() + "' into the resultlist", 5);
            }
        }
        for (var arrayElement in array){
            if (!arrayContainsElement(elements, array[arrayElement], compare)){
                result.push(array[arrayElement]);
                log("arrayDifference: Added '" + elements[element].name() + "' into the resultlist", 5);
            }
        }
        log("arrayDifference: results found '" + result.length + "'", 4);
        return result;
    }

    function arrayGetIndex(array, element, compare){
        if (!compare){
          	compare = equal;
        }
        for (var arrayElement in array){
            if (compare(array[arrayElement], element)){
                return arrayElement;
            }
        }
        return -1;
    }

    function arrayRemoveUndefined(array){
        array = arrayCreateArray(array);
        var result = [];
        for (var element in array){
            if (!(typeof array[element] === 'undefined' || !array[element])){
                result.push(array[element]);
            }
        }
        log("arrayRemoveUndefined: Removed '" + (array.length - result.length) + "' undefined or null entries from the array", 5);
        return result;
    }

    function arrayMissingElements(array, elements, compare){
        elements = arrayCreateArray(elements);
        var result = [];
        for (var element in elements){
            if (!arrayContainsElement(array, elements[element], compare)){
                result.push(elements[element]);
                log("arrayMissingElements: Added '" + elements[element] + "' into the resultlist", 5);
            }
        }
        log("arrayMissingElements: results found '" + result.length + "'", 4);
        return result;
    }

    function arrayRemoveElements(array, elements, compare){
        if (!compare){
          	compare = equal;
        }
        array = arrayCreateArray(array);
        elements = arrayCreateArray(elements);
        var result = [];
        for(var arrayElement in array){
            for(var element in elements){
                if (!compare(array[arrayElement], elements[element])){
                    result.push(array[arrayElement]);
                    log("arrayRemoveElements: Added '" + array[arrayElement] + "' into the resultlist", 5);
                }
            }
        }
        log("arrayRemoveElements: Removed '" + (array.length - result.length) + "' elements from the array", 4);
        return result;
    }

  	function equal(a, b){
      	return (a == b);
    }

    function isNumber(number){
      	return !isNaN(number);
    }

    function objectArrayParseAttribute(array, attribute, isFunction){
        array = arrayCreateArray(array);
        var result = [];
        for (var object in array){
          	if (isFunction){
              	result.push(array[object][attribute]());
            	log("objectArrayParseAttribute: Parsed '" + array[object][attribute]() + "' into the resultlist", 5);
            }else{
            	result.push(array[object][attribute]);
            	log("objectArrayParseAttribute: Parsed '" + array[object][attribute]() + "' into the resultlist", 5);
            }
        }
        log("objectArrayParseAttribute: results found '" + result.length + "'", 4);
        return result;
    }

    function objectFunctionEqualsElement(object, property, element, compare){
      	if (!compare){
          	compare = equal;
        }
        return compare(object[property](), element);
    }

    /*
        Lib Definition
    */

    var libModule = {
        general: {
            log: log,
            getBots: getActiveBotInstances,
        },

        channel: {
            getByName: channelGetChannelByName,
            getByNameParent: channelGetChannelByNameAndParent,
        },

        uid:{
            toClients: clientParseClients,
        },

        client: {
            equal: equalClientObjects,
            getUIDs: clientParseUIDs,
            removeClients: clientRemoveClients,
            search: {
                byAll: clientSearchByAll,
                multipleByAll: clientsSearchByAll,
            },
            serverGroups: {
                isMemberOf: clientServerGroupsIsMemberOf,
                isMemberOfAll: clientServerGroupsIsMemberOfAll,
                isMemberOfOne: clientServerGroupsIsMemberOfOne,
                addGroups: clientServerGroupAddToGroup,
                removeGroups: clientServerGroupRemoveFromGroup,
            },
        },

        serverGroups: {
            getIDs: serverGroupParseIDs,
            getGroups: serverGroupParseGroups,
        },

        chat: {

        },

        helper: {
            arrayCombineArrays: arrayCombineArrays,
            arrayContainsAll: arrayContainsAll,
            arrayContainsElement: arrayContainsElement,
            arrayContainsOne: arrayContainsOne,
            arrayCreateArray: arrayCreateArray,
            arrayDifference: arrayDifference,
            arrayGetIndex: arrayGetIndex,
            arrayMissingElements: arrayMissingElements,
            arrayRemoveElements: arrayRemoveElements,
            arrayRemoveUndefined: arrayRemoveUndefined,
            equal: equal,
            isNumber: isNumber,
            objectArrayParseAttribute: objectArrayParseAttribute,
            objectFunctionEqualsElement: objectFunctionEqualsElement,
        }
    };


    engine.export(libModule);
});
