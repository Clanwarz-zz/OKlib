registerPlugin({
    name: 'OK_lib',
    engine: '>= 0.13.37',
    version: '1.0',
    description: 'A lib that is OK. For other scripts to use.',
    author: 'Tuetchen || Smorrebrod || Cedrik <cedrik.paetz@gmail.com> && Diesmon || Dimos <dontmindme12@web.de> & ',
    vars: [
        {
            name: 'logLevel',
            title: 'Sets a global debug log level for all scripts that use this lib. The logs will be displayed in the instance logs.',
            type: 'select',
            options: ['1 - Critical','2 - Error','3 - Missing items','4 - Debug','5 - Ludicrous']
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

    event.on('connect', function() {
        var currentInstances = store.get('activeBotInstances');
        if (!currentInstances){
            currentInstances = [];
        }
        log("Registering as active Bot " + printObject(backend.getBotClient()), 5);
        currentInstances.push(backend.getBotClient().uid());
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
        if (ev.text == "!help" || ev.text == "!info"){
            ev.client.chat("This bot uses the OK_lib, which is a libary for basic script functions.");
        }
    });

    /**
     * Logs messages to the Sinusbot Webinterface instance console, depending on the set log level in the config
     * @param  {String} message  The String to print
     * @param  {Integer} logLevel log level of the message to check with the set log level
     */
    function log(message, logLevel){
        if (config.logLevel >= 0){
            if (logLevel-1 <= config.logLevel){
                engine.log(message);
            }
        }
    }

    /**
     * Provides the active Bot instances running on the Sinusbot Installation [Important: All instances need to run the script]
     * @return {Client[]} Returns all found Bot clients in a Array
     */
    function getActiveBotInstances(){
        var currentInstances = store.get('activeBotInstances');
        result = [];
        newStore = [];
        for (var element in currentInstances){
            var currentClient = backend.getClientByUniqueID(currentInstances[element]);
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

    /**
     * Returns the ID and the Name of a Channel as String
     * @param  {Channel} channel The Channel
     * @return {String}         String of Channel ID and Name
     */
    function channelToString(channel){
        return ("["+channel.id()+": "+channel.name()+"]");
    }

      /**
       * Returns a array of Channels which meet the provided criterias
       * @param  {String} attribute The Attribute to search for. E.g. 'name' or 'id'
       * @param  {String} value     The Value that should get compared with the Attribute
       * @param  {Channel[]} channels  Optional: The Channel Searchpool. If not provided all Channels will get used [Not Optional if compare gets provided]
       * @param  {Function} compare   Optional: A Function for how to compare the Value with the Attribute. If not provided Value and Attribute will get checked for equality
       * @return {Channel[]}           The Channels that matches the criterias
       */
    function channelGetChannels(attribute, value, channels, compare){
        if(!channels){
            log("channelGetChannels: Using all Channels", 5);
            channels = backend.getChannels();
        }
        else{
            channels = arrayCreateArray(channels);
            log("channelGetChannels: Using Channels " + printObject(channels), 5);
        }
        var result = [];
        for(var curChannel in channels){
            if(objectFunctionEqualsElement(channels[curChannel], attribute, value, compare)){
                result.push(channels[curChannel]);
                log("channelGetChannels: Found Channel " + printObject(channels[curChannel]), 5);
            }
        }
        return result;
    }

    /**
     * Returns all Subchannels of a given Channel
     * @param  {Channel} parentChannel The Channel to return the Subchannels of
     * @return {Channel[]}               Array of all Subchannels from the given Channel
     */
    function channelGetSubchannels(parentChannel){
        var channels = backend.getChannels();
        var result = [];
        for (var curChannel in channels){
            curParentChannel = channels[curChannel].parent();
            if (curParentChannel && equal(curParentChannel.id(), parentChannel.id())){
                result.push(channels[curChannel]);
                log("channelGetSubchannels: Found Channel " + printObject(channels[curChannel]), 5);
            }
        }
        return result;
    }

    /*
        Client
    */

    /**
     * Returns the ID, UID and Nick of a Client as a String
     * @param  {Client} client
     * @return {String}
     */
    function clientToString(client){
        return ("["+client.id()+"/"+client.uid()+": "+client.nick()+"]");
    }

    /**
     * Returns the ID, UID and Nick of a Client as a TeamSpeak3 useable Client-URL String
     * @param  {Client} client
     * @return {String}
     */
    function clientToURLString(client){
        return ("[URL=client://"+client.id()+"/"+client.uid()+"]"+client.nick()+"[/URL]");
    }

    /**
     * Compares two Clients against each other and decied if they are the same Client or not (Equal)
     * @param  {Client} firstClient
     * @param  {Client} secondClient
     * @return {Boolean}              True or False, depending if the Clients are equal or not.
     */
    function equalClientObjects(firstClient, secondClient){
        return firstClient.equals(secondClient);
    }

    /**
     * Filters a Client-array by another Client-array
     * @param  {Client[]} clients The Clients
     * @param  {Client[]} array   The Clients to filter out
     * @return {Client[]}         The new Clients
     */
    function clientFilterByClients(clients, array){
        return arrayRemoveElements(clients, array, equalClientObjects);
    }

    /**
     * Filters a Client-array by Servergroups
     * @param  {Client[]} clients The Clients
     * @param  {Client[]} array   The Servergroups for filtering Clients out of the have one of them
     * @return {Client[]}         The new Clients
     */
    function clientFilterByServerGroups(clients, array){
        clients = arrayCreateArray(clients);
        if(client.length == 0){
            log("clientFilterByServergroup: Provided no Client to filter for", 3);
            return;
        }
        result = [];
        for(var curClient in clients){
            if(!arrayContainsOne(arrayObjectParseAttribute(clients[curClient].getGroups(), id, true), array)){
                result.push(clients[curClient]);
                log("clientFilterByServergroup: Found Client " + printObject(clients[curClient]), 5);
            }
        }
        return result;
    }

    /**
     * Parses Client Objects into String UIDs and returns a Array of UIDs
     * @param  {Client[]} clients The Clients to parse
     * @return {String[]}         Array of parsed UID Strings
     */
    function clientParseUIDs(clients){
        clients = arrayCreateArray(clients);
        if(clients.length == 0){
            log("clientParseUIDs: Provided no Clients to parse", 3);
            return;
        }
        var result = [];
        for (var client in clients){
            result.push(clients[client].uid());
            log("clientsParseUIDs: Resolved UID '" + clients[client].uid() + "'", 5);
        }
        return result;
    }

    /**
     * Parses UIDs to Client Object. Works only for UID owners that are currently online.
     * @param  {String[]} UIDs A Array of UID Strings
     * @return {Client[]}      Array of parsed Client Objects
     */
    function clientParseClients(UIDs){
        UIDs = arrayCreateArray(UIDs);
        if(UIDs.length == 0){
            log("clientParseClients: Provided no UIDs to parse", 3);
            return;
        }
        var result = [];
        for (var curUID in UIDs){
            var client = backend.getClientByUID(UIDs[curUID]);
            if(client){
                result.push(client);
                log("clientsParseClient: Resolved UID '" + UIDs[curUID] + "' to '" + printObject(client) + "'", 5);
            }
            else{
                log("clientsParseClient: A client with the UID '" + UIDs[curUID] + "' could not be found on the server", 4);
            }
        }
        return result;
    }

    /**
     * Searches for a Client by the provided String and returns the matches.
     * @param  {String} stringToParse String to search for
     * @param  {Boolean} partMatch     Optional: Flag for using Part matching. If not provided Attribute and Value will be checked for equality (==)[Not optional if the Case Sensitive flag was set]
     * @param  {Boolean} caseSensitive Optional: Flag for using Case Sensitive search. If not provided Cases will be ignored [Not Optional if the Client Searchpool got provided]
     * @param  {Client[]} clients       Optional: The Client Searchpool. If not provided all clients will get used
     * @return {Client[] | Client}                A empty Array if nothing was found. A Client Object if only one matching Client was found or a Client Array if more than one matching Client was found.
     */
    function clientSearch(stringToParse, partMatch, caseSensitive, clients){
        if(!clients){
            log("clientSearch: Using all Clients", 5);
            clients = backend.getClients();
        }else{
            clients = arrayCreateArray(clients);
            log("clientSearch: Using Clients " + printObject(clients), 5);
        }
        var result = [];
        if(!caseSensitive){
            log("clientSearch: Ignore Case", 5);
            stringToParse = stringToParse.toLowerCase();
        }else{
            log("clientSearch: Case Sensitive Search", 5);
        }
        var compare = equal;
        if (partMatch){
            log("clientSearch: Using contains as comparator", 5);
            compare = contains;
        }else{
            log("clientSearch: Using equal as comparator", 5);
        }
        for(var client in clients){
            clientName = clients[client].name();
            if(!caseSensitive){
                clientName = clientName.toLowerCase();
            }
            if(compare(clientName, stringToParse)){
                result.push(clients[client]);
                log("clientSearch: Found a part match between '" + stringToParse + "' and " + printObject(clients[client]), 5);
            }
            else if(clients[client].uid() == stringToParse){
                result.push(clients[client]);
                log("clientSearch: Found a UID match between '" + stringToParse + "' and " + printObject(clients[client]), 5);
            }
            else if(clients[client].id() == stringToParse){
                result.push(clients[client]);
                log("clientSearch: Found a ID match between '" + stringToParse + "' and " + printObject(clients[client]), 5);
            }
        }
          if(result.length == 0){
            log("clientSearch: Found no matching client", 4);
            return result;
        }else if(result.length == 1){
            log("clientSearch: Found '1' matching client", 4);
            return result[0];
        }
        log("clientSearch: Found '" + result.length + "' matching clients", 4);
        return result;
    }

    /**
     * Returns a Array of Clients which meet the provided criterias
     * @param  {String} attribute String of the Attribute to check for
     * @param  {String} value     The Value the Attribute should have
     * @param  {Client[]} clients   A Client Searchpool
     * @param  {Function} compare  A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Client[]}           The matching Clients
     */
    function clientGetClients(attribute, value, clients, compare){
        if(!clients){
            log("clientGetClients: Using all Clients", 5);
            clients = backend.getClients();
        }else{
            clients = arrayCreateArray(clients);
            log("clientGetClients: Using Clients " + printObject(clients), 5);
        }
        var result = [];
        for(var curClient in clients){
            if(objectFunctionEqualsElement(clients[curClient], attribute, value, compare)){
                log("clientGetClients: Found Client " + printObject(clients[curClient]), 5);
                result.push(clients[curClient]);
            }
        }
        return result;
    }

    /**
    * Checks if a Client is the Member of all Server Groups.
    *
    * @param {Client} client     The tested Client as a Client Object.
    * @param {ServerGroup[] | Integer[]}     checkGroups The Groups that should be checked as an Array of GroupIDs.
    * @returns {Boolean}         True if the Client is in all Groups, else False.
    **/
    function clientServerGroupsIsMemberOfAll(client, checkGroups){
        checkGroups = serverGroupParseIDs(checkGroups);
        var serverGroups = serverGroupParseIDs(client.getServerGroups());
        return arrayContainsAll(serverGroups, checkGroups);
    }

    /**
    * Checks if a Client is the Member of one of the Server Groups.
    *
    * @param {Client} client The tested Client as a Client Object.
    * @param {ServerGroup[] | Integer[]} checkGroups The Groups that should be checked as an Array of GroupIDs.
    * @returns {Boolean} True if the Client is in one Group, else False.
    **/
    function clientServerGroupsIsMemberOfOne(client, checkGroups){
        checkGroups = serverGroupParseIDs(checkGroups);
        var serverGroups = serverGroupParseIDs(client.getServerGroups());
        return arrayContainsOne(serverGroups, checkGroups);
    }

    /**
    * Checks if a Client is the Member of a Server Group.
    *
    * @param {Client} client The tested Client as a Client Object.
    * @param {ServerGroup | Integer} checkGroups The GroupID of the Group that should be checked.
    * @returns {Boolean} True if the Client is Member of the Server Group, else False.
    **/
    function clientServerGroupsIsMemberOf(client, checkGroup){
        if (!isNumber(checkGroup)){
            log("clientServerGroupsIsMemberOf: Resolved the servergroup '" + printObject(checkGroup) + "' to the ID '" + checkGroup.id() + "'", 5);
            checkGroup = checkGroup.id();
        }
        var serverGroups = serverGroupParseIDs(client.getServerGroups());
        return arrayContainsElement(serverGroups, checkGroup);
    }

    /**
     * [clientServerGroupAddToGroups description]
     * @param  {Client} client Client to add ServerGroups to
     * @param  {ServerGroup[] | Integer[]} groups The ServerGroups or groupIDs to add
     */
    function clientServerGroupAddToGroups(client, groups){
        groups = arrayCreateArray(groups);
        if(groups.length == 0){
            log("clientServerGroupAddToGroups: Provided no Group to add", 3);
            return;
        }
        for (var curGroup in groups){
            if (!clientServerGroupsIsMemberOf(client, groups[curGroup])){
                client.addToServerGroup(groups[curGroup]);
                log("clientServerGroupAddToGroups: Client '" + printObject(client) + "' was added to the servergroup " + printObject(groups[curGroup]), 5);
            }
            else {
                log("clientServerGroupAddToGroups: Client '" + printObject(client) + "' already has the servergroup " + printObject(groups[curGroup]), 4);
            }
        }
    }

    /**
     * Removes the Clients from the given ServerGroups
     * @param  {Client} client    The Client to remove ServerGroups from
     * @param  {ServerGroup[] | Integer[]} groups The ServerGroups or groupIDs that should be removed from the Client
     */
    function clientServerGroupRemoveFromGroups(client, groups){
        groups = arrayCreateArray(groups);
        if(groups.length == 0){
            log("clientServerGroupAddToGroups: Provided no group to remove", 3);
            return;
        }
        for (var curGroup in groups){
            if (clientServerGroupsIsMemberOf(client, groups[curGroup])){
                client.removeFromServerGroup(groups[curGroup]);
                log("clientServerGroupRemoveFromGroups: Client '" + printObject(client) + "' was removed from the servergroup " + printObject(groups[curGroup]), 5);
            }
            else {
                log("clientServerGroupRemoveFromGroups: Client '" + printObject(client) + "' did not had the group " + printObject(groups[curGroup]), 4);
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
     * Returns a String Representation of a Group
     * @param  {Group} group
     * @return {String}    A String Representation of the given Group
     */
    function groupToString(group){
        return ("["+group.id()+": "+group.name()+"]");
    }

    /**
     * Parses the groupIDs from a given Array of ServerGroups
     * @param  {ServerGroup[]} serverGroups
     * @return {Integer[]} Returns an Array containing the parsed groupIDs
     */
    function serverGroupParseIDs(serverGroups){
        serverGroups = arrayCreateArray(serverGroups);
        var result = [];
        for (var serverGroup in serverGroups){
            if (isNumber(serverGroups[0])){
                result.push(serverGroups[serverGroup]);
            }else{
                result.push(serverGroups[serverGroup].id());
                log("serverGroupParseIDs: Resolved the servergroup '" + printObject(serverGroups[serverGroup]) + "' to the ID '" + serverGroups[serverGroup].id() + "'", 5);
            }
        }
        return result;
    }

    /**
     * Parses the ServerGroups from a given Array of groupIDs
     * @param  {Integer[]} groupIDs
     * @return {ServerGroup[]} Returns an Array containing the parsed ServerGroups
     */
    function serverGroupParseGroups(groupIDs){
        groupIDs = arrayCreateArray(groupIDs);
        var result = [];
        for (var curID in groupIDs){
            if (!isNumber(groupIDs[curID])){
                result.push(groupIDs[curID]);
            }else{
                var group = backend.getServerGroupByID(groupIDs[curID]);
                if (group){
                    result.push(group);
                    log("serverGroupParseGroups: Resolved the ID '" + groupIDs[curID] + "' to the servergroup " + printObject(group), 5);
                }
                else{
                    log("serverGroupParseGroups: A servergroup with the ID '" + groupIDs[curID] + "' was not found on the server", 2);
                }
            }
        }
        return result;
    }

    /*
        User
    */

    /**
     * Returns a String Representation of a User
     * @param  {User} user
     * @return {String}    A String Representation of the given User
     */
    function userToString(user){
        return ("["+user.id()+": "+user.name()+"]");
    }

    /**
     * Checks if the Sinusbot User has the required Sinusbot Privileges
     * @param  {User} user A Sinusbot User
     * @param  {Integer} privileges The numerical value of the required Privileges
     * @return {Boolean} Returns true if the Sinusbot User has the required Privileges
     */
    function userHasPrivileges(user, privileges){
        var userPriv = user.privileges();
        if ((userPriv & privileges) == privileges){
            return true;
        }
        return false;
    }

    /**
     * Retrieves the Clients Sinusbot Privileges
     * @param  {Client} client A Teamspeak Client
     * @return {Integer}  Returns the Privileges as a numerical value
     */
    function userGetClientPrivileges(client){
        var users = engine.getUsers();
        var privileges = 0;
        for (var userID in users){
            if (userIsClientUser(client, users[userID])){
                privileges = privileges | users[userID].privileges();
            }
        }
        return privileges;
    }

    /**
     * Checks if the Client has the required Sinusbot Privileges
     * @param  {Client} client  A Teamspeak Client
     * @param  {Integer} privileges The numerical value of the required Privileges
     * @return {Boolean} Returns true if the Client has the required Privileges
     */
    function userClientHasPrivileges(client, privileges){
        var clientPrivileges = userGetClientPrivileges(client);
        return ((clientPrivileges & privileges) == privileges);
    }

    /**
     * Checks if the Client has access to the given Sinusbot User
     * @param  {Client} client A Teamspeak Client
     * @param  {User} user A Sinusbot User
     * @return {Boolean} Returns true if the User either has a matching UID or the Client is Member of the required ServerGroup
     */
    function userIsClientUser(client, user){
        if (user.tsUid() == client.uid()){
            log("userIsClientUser: "+printObject(client)+"-"+printObject(user)+": UID Match", 5);
            return true;
        }
        if (clientServerGroupsIsMemberOf(client, user.tsGroupId())){
            log("userIsClientUser: "+printObject(client)+"-"+printObject(user)+": ServerGroup Match", 5);
            return true;
        }else{
            return false;
        }
    }

    /*
        Track
    */

    /**
     * Returns a String Representation of a Track
     * @param  {Track} track
     * @return {String}    A String Representation of the given Track
     */
    function trackToString(track){
        return ("["+track.artist()+": "+track.title()+"]");
    }

    /*
        Playlist
    */

    /**
     * Returns a String Representation of a Playlist
     * @param  {Playlist} playlist
     * @return {String}    A String Representation of the given Playlist
     */
    function playlistToString(playlist){
        return ("["+playlist.id()+": "+playlist.name()+"]");
    }

    /*
        Helper
    */

    /**
     * Checks if an Object is null or undefined
     * @param  {Object} element
     * @return {Boolean} Returns true if the Object is null or undefined
     */
    function empty(element){
        if (!element || typeof element === 'undefined'){
            return true;
        }
        return false;
    }

    /**
     * Returns a String Representation of an Object
     * @param  {Object} object
     * @return {String}    A String Representation of the given Object
     */
    function printObject(object){
        try{
            object.nick();
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
                                if (Array.isArray(object)){
                                    return arrayToString(object);
                                }else{
                                    return ""+object;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Returns a String Representation of an Array
     * @param  {Object[]} array
     * @return {String}    A String Representation of the given Array
     */
    function arrayToString(array){
        var result = "[";
        for (var i=0; i < array.length; i++){
            result += printObject(array[i]);
            if (i+1 < array.length){
                result += ",";
            }
        }
        result += "]";
        return result;
    }

    /**
     * Checks if an Array contains all Elements of another given Array
     * @param  {Object[]} array
     * @param  {Object[]} elements The Elements to search for in the Array
     * @param  {Function} compare  A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Boolean} Returns true if all Elements are contained in the given Array
     */
    function arrayContainsAll(array, elements, compare){
        if (arrayMissingElements(array, elements, compare).length > 0){
            return true;
        }else{
            return false;
        }
    }

    /**
     * Concatenates two Arrays
     * @param  {Object[]} array
     * @param  {Object[]} elements
     * @return {Object[]} Returns a new Array containing all Elements of the two given Arrays
     */
    function arrayCombineArrays(array, elements){
        array = arrayCreateArray(array);
        elements = arrayCreateArray(elements);
        var result = [];
        for(var i = 0; i < array.length; i++){
            result.push(array[i]);
        }
        for(var j = 0; j < elements.length; j++){
            result.push(elements[j]);
        }
        log("arrayCombineArrays: Found '" + result.length + "' Objects", 4);
        return result;
    }

    /**
     * Checks if an Array contains the given Element
     * @param  {Object[]} array
     * @param  {Object} element
     * @param  {Function} compare A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Boolean}  Returns true if the Element is contained in the Array
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
     * Checks if an Array contains at least one Element of another given Array
     * @param  {Object[]} array
     * @param  {Object[]} elements The Elements to search for in the Array
     * @param  {Function} compare  A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Boolean}  Returns true if at least one Element is contained in the given Array
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
     * Creates an Array containing the given Element or returns immediately if an Array is given
     * @param  {Object[] | Object} element
     * @return {Object[]} An Array containing the given Elements
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
     * Creates a Set of the given Array, removing any Duplicates
     * @param  {Object[]} array
     * @param  {Function} compare A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Object[]}  The Set representation of the given Array
     */
    function arrayCreateSet(array, compare){
        var result = [];
        if (!Array.isArray(array)){
            result.push(array);
            return result;
        }
        else{
               for (var i = 0; i < array.length; i++){
                    if (!arrayContainsElement(result, array[i], compare)){
                        result.push(array[i]);
                }
            }
            return result;
        }
    }

    /**
     * Returns the Elements that differ are contained in only one of the given Arrays
     * @param  {Object[]} array
     * @param  {Object[]} elements
     * @param  {Function} compare A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Object[]}    An Array that contains the Elements that were only present in one of the Arrays
     */
    function arrayDifference(array, elements, compare){
        var result = [];
        for (var element in elements){
            if (!arrayContainsElement(array, elements[element], compare)){
                result.push(elements[element]);
            }
        }
        for (var arrayElement in array){
            if (!arrayContainsElement(elements, array[arrayElement], compare)){
                result.push(array[arrayElement]);
            }
        }
        return result;
    }

    /**
     * Gets the Index of an Object in an Array or -1 if it is not contained
     * @param  {Object[]} array
     * @param  {Object} element
     * @param  {Function} compare  A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Integer}         [description]
     */
    function arrayGetIndex(array, element, compare){
        if (!compare){
            compare = equal;
        }
        for (var i = 0; i < array.length; i++){
            if (compare(array[i], element)){
                return i;
            }
        }
        return -1;
    }

    /**
     * Removes undefined and null entries from an Array
     * @param  {Object[]} array
     * @return {Object[]} A Copy of the Array with any undefined or null entries removed
     */
    function arrayRemoveUndefined(array){
        array = arrayCreateArray(array);
        var result = [];
        for (var i = 0; i < array.length; i++){
            if (!empty(array[i])){
                result.push(array[i]);
            }
        }
        log("arrayRemoveUndefined: Removed '" + (array.length - result.length) + "' undefined or null entries from the array", 4);
        return result;
    }

    /**
     * Returns the missing Elements in the Array
     * @param  {Object[]} array
     * @param  {Object[]} elements The Array that contains the Elements to search for
     * @param  {Function} compare A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Object[]}  An Array containing the missing Elements
     */
    function arrayMissingElements(array, elements, compare){
        elements = arrayCreateArray(elements);
        var result = [];
        for (var element in elements){
            if (!arrayContainsElement(array, elements[element], compare)){
                result.push(elements[element]);
            }
        }
        log("arrayMissingElements: Found '" + result.length + "' missing entries in the arrays", 4);
        return result;
    }

    /**
     * Removes the Elements of one Array of another Array
     * @param  {Object[]} array
     * @param  {Object[]} elements    The Array that contains the Elements to remove
     * @param  {Function} compare    A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Array}    A Copy of the Array that does not contain the removed Elements
     */
    function arrayRemoveElements(array, elements, compare){
        if (!compare){
            compare = equal;
        }
        array = arrayCreateArray(array);
        elements = arrayCreateArray(elements);
        var result = [];
        for(var i = 0; i < array.length; i++ ){
            for(var j = 0; j < elements.length; j++){
                if (!compare(array[i], elements[j])){
                    result.push(array[i]);
                }
            }
        }
        log("arrayRemoveElements: Removed '" + (array.length - result.length) + "' elements from the array", 4);
        return result;
    }

    /**
     * Checks if a is equal b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is equal b
     */
    function equal(a, b){
        return (a == b);
    }

    /**
     * Checks if a is not equal b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is not equal b
     */
    function unequal(a, b){
        return (a != b);
    }

    /**
     * Checks if a is greater b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is greater b
     */
    function greater(a, b){
        return (a > b);
    }

    /**
     * Checks if a is less b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is less b
     */
    function less(a, b){
        return (a < b);
    }

    /**
     * Checks if a is greater or equal b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is greater or equal b
     */
    function greaterOrEqual(a, b){
        return (a >= b);
    }

    /**
     * Checks if a is less or equal b
     * @param  {Object} a
     * @param  {Object} b
     * @return {Boolean}   Returns true when a is less or equal b
     */
    function lessOrEqual(a, b){
        return (a <= b);
    }

    /**
     * Checks if one String is contained in another
     * @param  {String} a
     * @param  {String} b
     * @return {Boolean}   Returns true when String b is contained in String a
     */
    function contains(a, b){
        if(a.indexOf(b) != -1){
            return true;
        }
        return false;
    }

    /**
     * Checks if one String is contained in another, ignoring the Case
     * @param  {String} a
     * @param  {String} b
     * @return {Boolean}   Returns true when String b is contained in String a
     */
    function containsIgnoreCase(a, b){
          if(a.toLowerCase().indexOf(b.toLowerCase()) != -1){
            return true;
        }
        return false;
    }

    /**
     * Checks if the value is a Number
     * @param  {Object}  number Object that should be checked
     * @return {Boolean}        Returns true if the Object is a Number
     */
    function isNumber(number){
        return !isNaN(number);
    }

    /**
     * Parse an Array of Objects to an Array of a single chosen Properties
     * @param  {Object[]}  array      Array to Parse
     * @param  {String}  attribute  Name of the Property that should be parsed
     * @param  {Boolean} isFunction Check when the Property is a function
     * @return {Object[]}  Parsed Array
     */
    function arrayObjectParseAttribute(array, attribute, isFunction){
        array = arrayCreateArray(array);
        var result = [];
        for (var object in array){
              if (isFunction){
                result.push(array[object][attribute]());
            }else{
                result.push(array[object][attribute]);
            }
        }
        log("arrayObjectParseAttribute: Found '" + result.length + "' Objects", 4);
        return result;
    }

    /**
     * Compares an objects property with a specific value
     * @param  {Object} object   Object to check
     * @param  {String} property Name of the Property that should be checked
     * @param  {Object} element  Value that should be compared to the Property
     * @param  {Function} compare  A Compare Function that should be used for the Comparison, if not set 'equal' is used
     * @return {Boolean}   Returns the Value of the Comparison
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
            getChannels: channelGetChannels,
            getSubchannels: channelGetSubchannels,
        },

        client: {
            toString: clientToString,
            toURLString: clientToURLString,
            equal: equalClientObjects,
            filterByClients: clientFilterByClients,
            filterByServerGroups: clientFilterByServerGroups,
            toUIDs: clientParseUIDs,
            parseFromUIDs: clientParseClients,
            getClients: clientGetClients,
            search: clientSearch,
            isMemberOfGroup: clientServerGroupsIsMemberOf,
            isMemberOfAll: clientServerGroupsIsMemberOfAll,
            isMemberOfOne: clientServerGroupsIsMemberOfOne,
            addToGroups: clientServerGroupAddToGroups,
            removeFromGroups: clientServerGroupRemoveFromGroups,
            isAuthorized: clientServerGroupsIsMemberOfOne,
            hasPrivileges: userClientHasPrivileges,
            getPrivileges: userGetClientPrivileges,
        },

        channelGroup: {
            toString: groupToString,
        },

        serverGroup: {
            toString: groupToString,
            toIDs: serverGroupParseIDs,
            toGroups: serverGroupParseGroups,
        },

        user: {
            toString: userToString,
            hasPrivileges: userHasPrivileges,
            getClientPrivileges: userGetClientPrivileges,
            isClientUser: userIsClientUser,
            privileges: {
                PRIV_LOGIN: 1,
                PRIV_LIST_FILE: 2,
                PRIV_UPLOAD_FILE: 4,
                PRIV_DELETE_FILE: 8,
                PRIV_EDIT_FILE: 16,
                PRIV_CREATE_PLAYLIST: 32,
                PRIV_DELETE_PLAYLIST: 64,
                PRIV_ADDTO_PLAYLIST: 128,
                PRIV_STARTSTOP: 256,
                PRIV_EDITUSERS: 512,
                PRIV_CHANGENICK: 1024,
                PRIV_BROADCAST: 2048,
                PRIV_PLAYBACK: 4096,
                PRIV_ENQUEUE: 8192,
                PRIV_ENQUEUENEXT: 16384,
                PRIV_EDITBOT: 65536,
                PRIV_EDITINSTANCE: 131072,
            }
        },

        track: {
            toString: trackToString,
        },

        playlist: {
            toString: playlistToString,
        },

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

        helper: {
            printObject: printObject,
            isNumber: isNumber,
            objectFunctionEqualsElement: objectFunctionEqualsElement,
        },

        comparator: {
            equal: equal,
            unequal: unequal,
            greater: greater,
            less: less,
            greaterEqual: greaterOrEqual,
            lessEqual: lessOrEqual,
            contains: contains,
            containsIgnoreCase: containsIgnoreCase,
        },
    };

    engine.export(libModule);
});
