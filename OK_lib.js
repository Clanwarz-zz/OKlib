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
            options: ['1 - Critical','2 - Error','3 - Missing items','4 - Debug','5 - Balls of steel']
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

    var backendEngine = engine.getBackend();

    var activeBotInstances = [];
    engine.on('load', function() {
       	var currentInstances = store.get('activeBotInstances');
      	if (!currentInstances){
          	currentInstances = [];
        }
      	currentInstances.push(backend.getBotClientID());
      	currentInstances = arrayCreateSet(currentInstances);
      	store.set('activeBotInstances', currentInstances);
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
        var currentInstances = store.get('activeBotInstances');
      	result = [];
      	newStore = [];
      	for (var element in currentInstances){
          	var currentClient = Backend.getClientByUniqueID(currentInstances[element]);
          	if (currentClient){
              	log("getActiveBotInstances: Active Bot " + printObject(currentClient) + " found", 5);
              	newStore.push(currentInstances[element]);
              	result.push(currentClient);
            }else{
              	log("getActiveBotInstances: Offline Bot " + currentInstances[element] + " removed", 4);
            }
        }
      	store.set('activeBotInstances', newStore);
      	return result;
    }

  	/*
  		Channel
  	*/

  	function channelToString(channel){
      	return ("["+channel.id()+": "+channel.name()+"]");
    }

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

  	function clientToString(client){
      	return ("["+client.id()+"/"+client.uid()+": "+client.nick()+"]");
    }

  	function clientToURLString(client){
      	return ("[URL=client://"+client.id()+"/"+client.uid()+"]"+client.nick()+"[/URL]");
    }

    function equalClientObjects(firstClient, secondClient){
        return firstClient.equals(secondClient);
    }

    function clientFilterByClients(clients, array){
        return arrayRemoveElements(clients, array, equalClientObjects);
    }

    function clientFilterByServergroups(clients, array){
        clients = arrayCreateArray(clients);
        if(client.length == 0){
            log(" clientFilterByServergroup: Provided no client to filter for", 3);
            return;
        }
        result = [];
        for(var curClient in clients){
            if(!arrayContainsOne(arrayObjectParseAttribute(clients[curClient].getGroups(), id, true), array)){
                result.push(clients[curClient]);
            }
        }
        return result;
    }

    function clientParseUIDs(clients){
        clients = arrayCreateArray(clients);
        if(clients.length == 0){
            log(" clientFilterByServergroup: Provided no servergroup to filter for", 3);
            return;
        }
        var result = [];
        for (var client in clients){
            result.push(clients[client].uid());
            log("clientsParseUIDs: Resolved UID '" + clients[client].uid() + "'", 5);
        }
      	log("clientsParseUIDs: UIDs resolved: '" + result.length + "'", 4);
        return result;
    }

    function clientParseClients(UIDs){
        UIDs = arrayCreateArray(UIDs);
        var result = [];
        for (var curUID in UIDs){
          	var client = backend.getClientByUID(UIDs[curUID]);
          	if(client){
            	result.push(client);
            	log("clientsParseClient: Resolved UID '" + UIDs[curUID] + "' to '" + printObject(client) + "'", 5);
            }
          	else{
              	log("clientsParseClient: A client with the UID '" + UIDs[curUID] + "' could not be found on the server", 3);
            }
        }
      	log("clientsParseClients: Clients resolved: '" + result.length + "'", 4);
        return result;
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
                log("clientsSearchByAll: Found a part match between '" + stringToParse + "' and '" + printObject(clients[client]) + "'", 5);
            }
            else if(clients[client].uid() == stringToParse){
                result.push(clients[client]);
                log("clientsSearchByAll: Found a UID match between '" + stringToParse + "' and '" + printObject(clients[client]) + "'", 5);
            }
            else if(clients[client].id() == stringToParse){
                result.push(clients[client]);
                log("clientsSearchByAll: Found a ID match between '" + stringToParse + "' and '" + printObject(clients[client]) + "'", 5);
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

    function clientServerGroupAddToGroups(client, groups){
        groups = arrayCreateArray(groups);
      	if(groups.length == 0){
            log("clientServerGroupAddToGroups: Provided no group to add", 3);
            return;
        }
        for (var curGroup in groups){
            if (!clientServerGroupsIsMemberOf(client, groups[curGroup])){
                client.addToServerGroup(groups[curGroup]);
                log("clientServerGroupAddToGroups: Client '" + printObject(client) + "' was added to the servergroup: '" + printObject(groups[curGroup]) + "'", 5);
            }
            else {
              	log("clientServerGroupAddToGroups: Client '" + printObject(client) + "' already has the servergroup '" + printObject(groups[curGroup]) + "'", 3);
            }
        }
    }

    function clientServerGroupRemoveFromGroups(client, groups){
        groups = arrayCreateArray(groups);
        if(groups.length == 0){
            log("clientServerGroupAddToGroups: Provided no group to remove", 3);
            return;
        }
        for (var curGroup in groups){
        	if (clientServerGroupsIsMemberOf(client, groups[curGroup])){
                client.removeFromServerGroup(groups[curGroup]);
                log("clientServerGroupRemoveFromGroups: Client '" + printObject(client) + "' was removed from the servergroup: '" + printObject(groups[curGroup]) +"'", 5);
            }
            else {
                log("clientServerGroupRemoveFromGroups: Client '" + printObject(client) + "' did not had the group '" + printObject(groups[curGroup]) + "'", 5);
            }
        }
    }

  	/*
    	Strings
    */

    /*
        Group
    */

    /**
     * [groupToString description]
     * @param  {[type]} serverGroup [description]
     * @return {[type]}             [description]
     */
  	function groupToString(serverGroup){
      	return ("["+serverGroup.id()+": "+serverGroup.name()+"]");
    }

    /**
     * [serverGroupParseIDs description]
     * @param  {[type]} serverGroups [description]
     * @return {[type]}              [description]
     */
    function serverGroupParseIDs(serverGroups){
        serverGroups = arrayCreateArray(serverGroups);
        if (isNumber(serverGroups[0])){
            return serverGroups;
        }
        var result = [];
        for (var serverGroup in serverGroups){
            result.push(serverGroups[serverGroup].id());
          	log("serverGroupParseIDs: Resolved the servergroup '" + printObject(serverGroups[serverGroup]) + "' to the ID '" + serverGroups[serverGroup].id() + "'", 5);
        }
        return result;
    }

    /**
     * [serverGroupParseGroups description]
     * @param  {[type]} groupIDs [description]
     * @return {[type]}          [description]
     */
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
                log("serverGroupParseGroups: Resolved the ID '" + groupIDs[curID] + "' to the servergroup '" + printObject(group) + "'", 5);
            }
          	else{
              	log("serverGroupParseGroups: A servergroup with the ID '" + groupIDs[curID] + "' was not found on the server", 2);
            }
        }
        return result;
    }

    /*
    	User
    */

    /**
     * [userToString description]
     * @param  {[type]} user [description]
     * @return {[type]}      [description]
     */
    function userToString(user){
      	return ("["+user.id()+": "+user.name()+"]");
    }

    /*
    	Track
    */

    /**
     * [trackToString description]
     * @param  {[type]} track [description]
     * @return {[type]}       [description]
     */
    function trackToString(track){
      	return ("["+track.artist()+": "+track.title()+"]");
    }

    /*
    	Playlist
    */

    /**
     * [playlistToString description]
     * @param  {[type]} playlist [description]
     * @return {[type]}          [description]
     */
    function playlistToString(playlist){
      	return ("["+playlist.id()+": "+playlist.name()+"]");
    }

    /*
        Helper
    */

    function empty(element){
        if (typeof element === 'undefined' || !element){
            return true;
        }
        return false;
    }

    /**
     * [printObject description]
     * @param  {[type]} object [description]
     * @return {[type]}        [description]
     */
    function printObject(object){
      	try{
          	object.firstSeen();
          	return clientToString(object);
        }catch(err){
          	try{
              	object.icon();
              	return groupToString(object);
            }catch(err){
                  try{
                      object.codec();
                      return channelToString(object);
                  }catch(err){
						try{
                            object.isAdmin();
                            return userToString(object);
                        }catch(err){
                              try{
                                  object.artist();
                                  return trackToString(object);
                              }catch(err){
                                    try{
                                        object.getTracks();
                                        return playlistToString(object);
                                    }catch(err){
                                          return ""+object;
                                    }
                              }
                        }
                  }
          	}
        }
    }

    /**
     * [arrayToString description]
     * @param  {[type]} array [description]
     * @return {[type]}       [description]
     */
    function arrayToString(array){
      	var result = "[";
      	for (var element in array){
        	result += printObject(array[element]);
          	if (element+1 < array.length){
              	result += ",";
            }
      	}
      	result += "]";
      	return result;
    }

    /**
     * [arrayContainsAll description]
     * @param  {[type]} array    [description]
     * @param  {[type]} elements [description]
     * @param  {[type]} compare  [description]
     * @return {[type]}          [description]
     */
    function arrayContainsAll(array, elements, compare){
        if (arrayMissingElements(array, elements, compare).length > 0){
            return true;
        }else{
            return false;
        }
    }

    /**
     * [arrayCombineArrays description]
     * @param  {[type]} array    [description]
     * @param  {[type]} elements [description]
     * @return {[type]}          [description]
     */
    function arrayCombineArrays(array, elements){
        array = arrayCreateArray(array);
        elements = arrayCreateArray(elements);
        var result = [];
        for(var arrayElement in array){
            result.push(array[arrayElement]);
            log("arrayCombineArrays: Added '" + printObject(array[arrayElement]) + "' from the first array into the combined one'", 5);
        }
        for(var element in elements){
            result.push(elements[element]);
            log("arrayCombineArrays: Added '" + printObject(elements[element]) + "' from the second array into the combined one'", 5);
        }
        log("arrayCombineArrays: The combined result has '" + result.length + "' entries now", 4);
        return result;
    }

    /**
     * [arrayContainsElement description]
     * @param  {[type]} array   [description]
     * @param  {[type]} element [description]
     * @param  {[type]} compare [description]
     * @return {[type]}         [description]
     */
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

    /**
     * [arrayContainsOne description]
     * @param  {[type]} array    [description]
     * @param  {[type]} elements [description]
     * @param  {[type]} compare  [description]
     * @return {[type]}          [description]
     */
    function arrayContainsOne(array, elements, compare){
        for (var element in elements){
            if (arrayContainsElement(array, elements[element], compare)){
                return true;
            }
        }
        return false;
    }

    /**
     * [arrayCreateArray description]
     * @param  {[type]} element [description]
     * @return {[type]}         [description]
     */
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

    /**
     * [arrayCreateSet description]
     * @param  {[type]} array   [description]
     * @param  {[type]} compare [description]
     * @return {[type]}         [description]
     */
  	function arrayCreateSet(array, compare){
        var result = [];
      	if (!Array.isArray(array)){
            result.push(array);
            return result;
        }
        else{
          	for (var element in array){
              	if (!arrayContainsElement(result, array[element], compare)){
                  	result.push(element);
                }
            }
            return result;
        }
    }

    /**
     * [arrayDifference description]
     * @param  {[type]} array    [description]
     * @param  {[type]} elements [description]
     * @param  {[type]} compare  [description]
     * @return {[type]}          [description]
     */
    function arrayDifference(array, elements, compare){
        var result = [];
        for (var element in elements){
            if (!arrayContainsElement(array, elements[element], compare)){
                result.push(elements[element]);
                log("arrayDifference: Added '" + printObject(elements[element]) + "' into the resultarray", 5);
            }
        }
        for (var arrayElement in array){
            if (!arrayContainsElement(elements, array[arrayElement], compare)){
                result.push(array[arrayElement]);
                log("arrayDifference: Added '" + printObject(array[arrayElement]) + "' into the resultarray", 5);
            }
        }
        log("arrayDifference: results found '" + result.length + "'", 4);
        return result;
    }

    /**
     * [arrayGetIndex description]
     * @param  {[type]} array   [description]
     * @param  {[type]} element [description]
     * @param  {[type]} compare [description]
     * @return {[type]}         [description]
     */
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

    /**
     * [arrayRemoveUndefined description]
     * @param  {[type]} array [description]
     * @return {[type]}       [description]
     */
    function arrayRemoveUndefined(array){
        array = arrayCreateArray(array);
        var result = [];
        for (var element in array){
            if (!empty(array[element])){
                result.push(array[element]);
            }
        }
        log("arrayRemoveUndefined: Removed '" + (array.length - result.length) + "' undefined or null entries from the array", 5);
        return result;
    }

    /**
     * [arrayMissingElements description]
     * @param  {[type]} array    [description]
     * @param  {[type]} elements [description]
     * @param  {[type]} compare  [description]
     * @return {[type]}          [description]
     */
    function arrayMissingElements(array, elements, compare){
        elements = arrayCreateArray(elements);
        var result = [];
        for (var element in elements){
            if (!arrayContainsElement(array, elements[element], compare)){
                result.push(elements[element]);
                log("arrayMissingElements: Added '" + printObject(elements[element]) + "' into the resultlist", 5);
            }
        }
        log("arrayMissingElements: results found '" + result.length + "'", 4);
        return result;
    }

    /**
     * [arrayRemoveElements description]
     * @param  {[type]} array    [description]
     * @param  {[type]} elements [description]
     * @param  {[type]} compare  [description]
     * @return {[type]}          [description]
     */
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
                    log("arrayRemoveElements: Added '" + printObject(array[arrayElement]) + "' into the resultlist", 5);
                }
            }
        }
        log("arrayRemoveElements: Removed '" + (array.length - result.length) + "' elements from the array", 4);
        return result;
    }

    /**
     * [equal description]
     * @param  {[type]} a [description]
     * @param  {[type]} b [description]
     * @return {[type]}   [description]
     */
  	function equal(a, b){
      	return (a == b);
    }

    /**
     * [isNumber description]
     * @param  {[type]}  number [description]
     * @return {Boolean}        [description]
     */
    function isNumber(number){
      	return !isNaN(number);
    }

    /**
     * [arrayObjectParseAttribute description]
     * @param  {[type]}  array      [description]
     * @param  {[type]}  attribute  [description]
     * @param  {Boolean} isFunction [description]
     * @return {[type]}             [description]
     */
    function arrayObjectParseAttribute(array, attribute, isFunction){
        array = arrayCreateArray(array);
        var result = [];
        for (var object in array){
          	if (isFunction){
              	result.push(array[object][attribute]());
            	log("arrayObjectParseAttribute: Parsed '" + array[object][attribute]() + "' into the resultlist", 5);
            }else{
            	result.push(array[object][attribute]);
            	log("arrayObjectParseAttribute: Parsed '" + array[object][attribute]() + "' into the resultlist", 5);
            }
        }
        log("arrayObjectParseAttribute: results found '" + result.length + "'", 4);
        return result;
    }

    /**
     * [objectFunctionEqualsElement description]
     * @param  {[type]} object   [description]
     * @param  {[type]} property [description]
     * @param  {[type]} element  [description]
     * @param  {[type]} compare  [description]
     * @return {[type]}          [description]
     */
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
          	toString: channelToString,
            getByName: channelGetChannelByName,
            getByNameAndParent: channelGetChannelByNameAndParent,
        },

        client: {
          	toString: clientToString,
          	toURLString: clientToURLString,
            equal: equalClientObjects,
            filterByClients: clientFilterByClients,
            filterByServergroups: clientFilterByServergroups,
            toUIDs: clientParseUIDs,
          	parseFromUIDs: clientParseClients,
            search: {
                findAll: clientsSearchByAll,
            },
            serverGroups: {
                isMemberOfGroup: clientServerGroupsIsMemberOf,
                isMemberOfAll: clientServerGroupsIsMemberOfAll,
                isMemberOfOne: clientServerGroupsIsMemberOfOne,
                addToGroups: clientServerGroupAddToGroups,
                removeFromGroups: clientServerGroupRemoveFromGroups,
            },
        },

      	channelGroup: {
          	toString: groupToString,
        },

        serverGroups: {
          	toString: groupToString,
            toIDs: serverGroupParseIDs,
            toGroups: serverGroupParseGroups,
        },

        user: {
			toString: userToString,
        },

      	track: {
			track: trackToString,
        },

      	playlist: {
			playlist: playlistToString,
        },

        helper: {
          	printObject: printObject,
          	array: {
              	toString: arrayToString,
                combineArrays: arrayCombineArrays,
                containsAll: arrayContainsAll,
                containsElement: arrayContainsElement,
                containsOne: arrayContainsOne,
                createArray: arrayCreateArray,
              	toSet: arrayCreateSet,
                difference: arrayDifference,
                getIndex: arrayGetIndex,
                missingElements: arrayMissingElements,
                removeElements: arrayRemoveElements,
                removeUndefined: arrayRemoveUndefined,
              	parseAttribute: arrayObjectParseAttribute,
            },
          	comparators: {
              	equal: equal,
            },
            isNumber: isNumber,
            objectFunctionEqualsElement: objectFunctionEqualsElement,
        }
    };

    engine.export(libModule);
});
