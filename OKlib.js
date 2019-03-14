registerPlugin({
    name: 'OKlib',
    engine: '>= 1.0.0',
    version: '1.1.0',
    autorun: true,
    description: 'A lib that is OK for other scripts to use.',
    author: 'Tuetchen || Smorrebrod || Cedrik <cedrik.paetz@gmail.com> && Diesmon || Dimos <dontmindme12@web.de> || Relentless <RLNT@damn-community.com>',
    vars: [{
        name: 'logLevel',
        title: 'Sets a global debug log level for all scripts that use this lib. The logs will be displayed in the instance log.',
        type: 'select',
        options: ['1 - Critical', '2 - Error', '3 - Warning', '4 - Debug', '5 - Ludicrous'],
        default: 1
    }]
},

function (SinusBot, config) {

    const event = require('event');
    const engine = require('engine');
    const store = require('store');
    const backend = require('backend');

    engine.notify('OKlib loaded');
    const backendEngine = engine.getBackend();

    const version = '1.1.0';
    let libLogLevel = config.logLevel || 1;

    if (backend.isConnected()) {
        let currentInstances = store.get('activeBotInstances');
        if (!currentInstances) currentInstances = [];
        log('Registering as active Bot ' + printObject(backend.getBotClient()), 5);
        currentInstances.push(backend.getBotClient().uid());
        currentInstances = arrayCreateSet(currentInstances, undefined);
        store.set('activeBotInstances', currentInstances);
    }

    event.on('connect', () => {
        let currentInstances = store.get('activeBotInstances');
        if (!currentInstances) currentInstances = [];
        log('Registering as active Bot ' + printObject(backend.getBotClient()), 5);
        currentInstances.push(backend.getBotClient().uid());
        currentInstances = arrayCreateSet(currentInstances, undefined);
        store.set('activeBotInstances', currentInstances);
    });
    
    event.on('clientMove', function (ev) {
        if (ev.client.isSelf() && !ev.fromChannel) {
            let currentInstances = store.get('activeBotInstances');
            if (!currentInstances) {
                currentInstances = [];
            }
            log("Registering as active Bot " + printObject(backend.getBotClient()), 5);
            currentInstances.push(backend.getBotClient().uid());
            currentInstances = arrayCreateSet(currentInstances);
            store.set('activeBotInstances', currentInstances);
        }
    });

    event.on('chat', ev => {
        if (ev.text === '!help' || ev.text === '!info')
            ev.client.chat('This bot uses the [url=https://forum.sinusbot.com/resources/oklib.325/]OKlib[/url], which is a library for basic script functions. The full documentation can be found [url=http://server-n2.de/OKlib/external]here[/url].');
    });

    /**
     * checks the current version of OKlib
     * @param {String} wantedVersion the OKlib version your script needs | provided as '1.0.0' for example
     * @return {Boolean} returns true if the installed version is newer
     */
    function checkVersion(wantedVersion) {
        return version >= wantedVersion;
    }

    /**
     * logs messages to the Sinusbot webinterface instance console depending on the set log level in the config
     * @param {String} message  the String to print
     * @param {Integer} logLevel log level of the message to check with the set log level
     */
    function log(message, logLevel) {
        if (logLevel - 1 <= libLogLevel) engine.log(message);
    }

    /**
     * provides the active bot instances running on the Sinusbot installation [important: all instances need to run the script]
     * @return {Client[]} returns all found bot clients in an array
     */
    function getActiveBotInstances() {
        let currentInstances = store.get('activeBotInstances');
        let result, newStore = [];
        currentInstances.forEach(e => {
            let currentClient = backend.getClientByUID(e);
            if (currentClient) {
                log('getActiveBotInstances: Active Bot ' + printObject(currentClient) + ' found', 5);
                newStore.push(e);
                result.push(currentClient);
            } else {
                log('getActiveBotInstances: Offline Bot ' + e + ' removed', 4);
            }
        });
        store.set('activeBotInstances', newStore);
        return result;
    }

    /*
        Channel
    */

    /**
     * returns the ID and the name of a channel as string
     * @param {Channel} channel the channel
     * @return {String} string of channel ID and name
     */
    function channelToString(channel) {
        return ('[' + channel.id() + ': ' + channel.name() + ']');
    }

    /**
     * returns an array of channels which meet the provided criterias
     * @param {String} attribute the attribute to search for | e.g. 'name' or 'id'
     * @param {String} value the value that should get compared with the attribute
     * @param {Channel[]} channels optional: the channel searchpool | if not provided, all Channels will get used [not optional if compare gets provided]
     * @param {Function} compare optional: a function for how to compare the value with the attribute | if not provided value and attribute will get checked for equality
     * @return {Channel[]} the channels that match the criterias
     */
    function channelGetChannels(attribute, value, channels, compare) {
        if (!channels) {
            channels = backend.getChannels();
            log('channelGetChannels: Using all Channels', 5);
        } else {
            channels = arrayCreateArray(channels);
            log('channelGetChannels: Using Channels ' + printObject(channels), 5);
        }
        let result = [];
        channels.forEach(e => {
            if (objectFunctionEqualsElement(e, attribute, value, compare)) {
                result.push(e);
                log('channelGetChannels: Found Channel ' + printObject(e), 5);
            }
        });
        return result;
    }

    /**
     * returns the default channel as a channel object
     * @return {Channel} default channel on the server or undefined if non is found
     */
    function channelGetDefault() {
        let defaultChannel = backend.getChannels().find(channel => {
            return channel.isDefault();
        });
        return defaultChannel;
    }

    /**
     * returns all subchannels of a given channel
     * @param {Channel} parentChannel the channel or channelID of the channel to return the subchannels of
     * @param {Channel[]} channels optional: the channel searchpool | if not provided, all channels will get used
     * @return {Channel[]} array of all subchannels from the given channel
     */
    function channelGetSubChannels(parentChannel, channels) {
        let parentChannelID = (isNumber(parentChannel)) ? parentChannel : parentChannel.id();
        if (!channels) {
            channels = backend.getChannels();
            log('channel.getSubChannels: Using all Channels', 5);
        } else {
            channels = arrayCreateArray(channels);
            log('channel.getSubChannels: Using Channels ' + printObject(channels), 5);
        }
        let result = [];
        channels.forEach(e => {
            let curParentChannel = e.parent();
            if (curParentChannel && equal(curParentChannel.id(), parentChannelID)) {
                result.push(e);
                log('channel.getSubChannels: Found Channel ' + printObject(e), 5);
            }
        });
        return result;
    }

    /**
     * returns all subchannels of a given channel | this includes subchannels of subchannels
     * @param {Channel | Integer | String} parentChannel the channel or channelID of the channel to return all subchannels of
     * @return {Channel[]} array of all subchannels from the given channel
     */
    function channelGetAllSubChannels(parentChannel) {
        if (isNumber(parentChannel)) {
            parentChannel = backend.getChannelByID(parentChannel);
            if (!parentChannel) {
                log('channel.getAllSubChannels: The provided channel ID does not exist on the server', 3);
                return [];
            }
        }
        let parents = [parentChannel];
        let channels = [];
        while (parents.length !== 0) {
            let parent = parents.pop();
            channels.push(parent);
            parents = parents.concat(channelGetSubChannels(parent, undefined));
        }
        log('channel.getAllSubChannels: Found ' + channels.length + ' subchannels for the channel ' + printObject(parentChannel), 5);
        return channels.slice(1);
    }

    function channelIsSubChannelOf(parentChannel, subChannel) {
        if (isNumber(parentChannel)) {
            parentChannel = backend.getChannelByID(parentChannel);
            if (!parentChannel) {
                log('channel.isSubChannelOf: The provided channel ID does not exist on the server', 3);
                return false;
            }
        }
        let parent = subChannel.parent();
        while (parent) {
            if (parent && parent.id() === parentChannel.id()) {
                log('channel.isSubChannelOf: ' + printObject(subChannel) + ' is a subchannel of ' + printObject(parentChannel), 4);
                return true;
            }
            parent = parent.parent();
        }
        log('channel.isSubChannelOf: ' + printObject(subChannel) + ' is not a subchannel of ' + printObject(parentChannel), 4);
        return false;
    }

    function channelGetRelativeDepth(parentChannel, subChannel) {
        if (isNumber(parentChannel)) {
            parentChannel = backend.getChannelByID(parentChannel);
            if (!parentChannel) {
                log('channel.subChannelDepth: The provided channel ID does not exist on the server', 3);
                return false;
            }
        }
        let depth = 0;
        let parent = subChannel.parent();
        while (parent) {
            depth++;
            if (parent && parent.id() === parentChannel.id()) {
                log('channel.subChannelDepth: ' + printObject(subChannel) + ' is a subchannel of ' + printObject(parentChannel) + 'with a depth of ' + depth, 4);
                return depth;
            }
            parent = parent.parent();
        }
        log('channel.subChannelDepth: ' + printObject(subChannel) + ' is not a subchannel of ' + printObject(parentChannel), 4);
        return 0;
    }

    function channelGetAbsoluteDepth(channel) {
        let depth = 0;
        let parent = channel.parent();
        while (parent) {
            depth++;
            parent = parent.parent();
        }
        return depth;
    }

    /**
     * Compares two Channels against each other and decied if they are the same Channel or not (Equal)
     * @param  {Client} firstChannel
     * @param  {Client} secondChannel
     * @return {Boolean}              True or False, depending if the Channels are equal or not.
     */
    function equalChannelObjects(firstChannel, secondChannel) {
        return firstChannel.equals(secondChannel);
    }

    /*
        Client
    */

    /**
     * returns the ID, UID and nick of a client as a string
     * @param {Client} client
     * @return {String}
     */
    function clientToString(client) {
        return ('[' + client.id() + '/' + client.uid() + ': ' + client.nick() + ']');
    }

    /**
     * returns the ID, UID and nick of a client as a TeamSpeak3 useable client URL string
     * @param {Client} client
     * @return {String}
     */
    function clientToURLString(client) {
        return ('[URL=client://' + client.id() + '/' + client.uid() + ']' + client.nick() + '[/URL]');
    }

    /**
     * parses a TS3 client URL string into an client object
     * @param {String} url the URL string to parse
     * @return {Object} returns a client object or undefined if nothing was found
     */
    function clientUrlToClient(url) {
        if (typeof url !== 'string') return undefined;
        let match = url.match(/\[url=client:\/\/(\d+)\/([\w\d/+]{27}=)~?(.*)\](.*)?\[\/url\]/i);
        if (!match) return undefined;
        let client = backend.getClientByID(match[1]);
        if (client && client.uid() === match[2]) return client;
        client = backend.getClientByUID(match[2]);
        if (client) return client;
        return undefined;
    }

    /**
     * compares two clients against each other and decides if they are the same client or not (equal)
     * @param {Client} firstClient
     * @param {Client} secondClient
     * @return {Boolean} true or false, depending on if the clients are equal or not
     */
    function equalClientObjects(firstClient, secondClient) {
        return firstClient.equals(secondClient);
    }

    /**
     * filters a client array by another client array
     * @param {Client[]} clients the clients
     * @param {Client[]} array the clients to filter out
     * @return {Client[]} the new clients
     */
    function clientFilterByClients(clients, array) {
        return arrayRemoveElements(clients, array, equalClientObjects);
    }

    /**
     * parses client objects into string UIDs and returns an array of UIDs
     * @param {Client[]} clients the clients to parse
     * @return {String[]} array of parsed UID strings
     */
    function clientParseUIDs(clients) {
        clients = arrayCreateArray(clients);
        if (clients.length === 0) {
            log('clientParseUIDs: Provided no Clients to parse', 3);
            return;
        }
        let result = [];
        clients.forEach(e => {
            result.push(e.uid());
            log('clientsParseUIDs: Resolved UID ' + e.uid(), 5);
        });
        return result;
    }

    /**
     * parses UIDs to client object | only works for UID owners that are currently online
     * @param {String[]} UIDs an array of UID strings
     * @return {Client[]} returns an array of parsed client objects
     */
    function clientParseClients(UIDs) {
        UIDs = arrayCreateArray(UIDs);
        if (UIDs.length === 0) {
            log('clientParseClients: Provided no UIDs to parse', 3);
            return;
        }
        let result = [];
        UIDs.forEach(e => {
            let client = backend.getClientByUID(e);
            if (client) {
                result.push(client);
                log('clientsParseClient: Resolved UID ' + e + ' to ' + printObject(client), 5);
            } else {
                log('clientsParseClient: A client with the UID ' + e + ' could not be found on the server', 4);
            }
        });
        return result;
    }

    /**
     * searches for a client by the provided string and returns the matches
     * @param {String} stringToParse string to search for
     * @param {Boolean} partMatch optional: flag for using part matching | if not provided, attribute and value will be checked for equality (==) [not optional if the case sensitive flag was set]
     * @param {Boolean} caseSensitive optional: flag for using case sensitivity | if not provided, cases will be ignored [not optional if the client searchpool got provided]
     * @param {Client[]} clients optional: the client searchpool | if not provided, all clients will get used
     * @return {Client[]} returns an array with all found client objects | empty if nothing was found
     */
    function clientSearch(stringToParse, partMatch, caseSensitive, clients) {
        if (!clients) {
            clients = backend.getClients();
            log('clientSearch: Using all Clients', 5);
        } else {
            clients = arrayCreateArray(clients);
            log('clientSearch: Using Clients ' + printObject(clients), 5);
        }
        let result = [];
        if (!caseSensitive) {
            stringToParse = stringToParse.toLowerCase();
            log('clientSearch: Ignore Case', 5);
        } else {
            log('clientSearch: Case Sensitive Search', 5);
        }
        let compare = equal;
        if (partMatch) {
            compare = contains;
            log('clientSearch: Using contains as comparator', 5);
        } else {
            log('clientSearch: Using equal as comparator', 5);
        }
        clients.forEach(e => {
            let clientName = e.name();
            if (!caseSensitive) clientName = clientName.toLowerCase();
            if (compare(clientName, stringToParse)) {
                result.push(e);
                log('clientSearch: Found a part match between ' + stringToParse + ' and ' + printObject(e), 5);
            } else if (e.uid() === stringToParse) {
                result.push(e);
                log('clientSearch: Found a UID match between ' + stringToParse + ' and ' + printObject(e), 5);
            } else if (e.id() === stringToParse) {
                result.push(e);
                log('clientSearch: Found a ID match between ' + stringToParse + ' and ' + printObject(e), 5);
            }
        });
        log('clientSearch: Found ' + result.length + ' matching clients', 4);
        return result;
    }

    /**
     * returns an array of clients which meet the provided criteria
     * @param {String} attribute string of the attribute to check for
     * @param {String} value the value the attribute should have
     * @param {Client[]} clients a client searchpool
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Client[]} the matching clients
     */
    function clientGetClients(attribute, value, clients, compare) {
        if (!clients) {
            clients = backend.getClients();
            log('clientGetClients: Using all Clients', 5);
        } else {
            clients = arrayCreateArray(clients);
            log('clientGetClients: Using Clients ' + printObject(clients), 5);
        }
        let result = [];
        clients.forEach(e => {
            if (objectFunctionEqualsElement(e, attribute, value, compare)) {
                log('clientGetClients: Found Client ' + printObject(e), 5);
                result.push(e);
            }
        });
        return result;
    }

    /**
     * checks if a client is the member of all server groups
     *
     * @param {Client} client the tested client as a client object
     * @param {ServerGroup[] | Integer[]} checkGroups the groups that should be checked as an array of GroupIDs
     * @returns {Boolean} true if the client is in all groups, else false.
     **/
    function clientServerGroupsIsMemberOfAll(client, checkGroups) {
        checkGroups = serverGroupParseIDs(checkGroups);
        let serverGroups = serverGroupParseIDs(client.getServerGroups());
        return arrayContainsAll(serverGroups, checkGroups, undefined);
    }

    /**
     * checks if a client is the member of one of the server groups
     *
     * @param {Client} client the tested client as a client object
     * @param {ServerGroup[] | Integer[]} checkGroups the groups that should be checked as an array of GroupIDs
     * @returns {Boolean} true if the client is in one group, else false
     **/
    function clientServerGroupsIsMemberOfOne(client, checkGroups) {
        checkGroups = serverGroupParseIDs(checkGroups);
        let serverGroups = serverGroupParseIDs(client.getServerGroups());
        return arrayContainsOne(serverGroups, checkGroups, undefined);
    }

    /**
     * checks if a client is the member of a server group
     *
     * @param {Client} client the tested client as a client object
     * @param {ServerGroup | Integer} checkGroup the groupID of the group that should be checked
     * @returns {Boolean} true if the client is member of the server group, else false
     **/
    function clientServerGroupsIsMemberOf(client, checkGroup) {
        if (!checkGroup) {
            log('clientServerGroupsIsMemberOf: No ServerGroup was given!', 3);
            return false;
        }
        if (!isNumber(checkGroup)) {
            log('clientServerGroupsIsMemberOf: Resolved the servergroup ' + printObject(checkGroup) + ' to the ID ' + checkGroup.id(), 5);
            checkGroup = checkGroup.id();
        }
        let serverGroups = serverGroupParseIDs(client.getServerGroups());
        return arrayContainsElement(serverGroups, checkGroup, undefined);
    }

    /**
     * [clientServerGroupAddToGroups description]
     * @param {Client} client client to add servergroups to
     * @param {ServerGroup[] | Integer[]} groups the servergroups or groupIDs to add
     */
    function clientServerGroupAddToGroups(client, groups) {
        groups = arrayCreateArray(groups);
        if (groups.length === 0) {
            log('clientServerGroupAddToGroups: Provided no Group to add', 3);
            return;
        }
        groups.forEach(e => {
            if (!clientServerGroupsIsMemberOf(client, e)) {
                client.addToServerGroup(e);
                log('clientServerGroupAddToGroups: Client ' + printObject(client) + ' was added to the servergroup ' + printObject(e), 5);
            } else {
                log('clientServerGroupAddToGroups: Client ' + printObject(client) + ' already has the servergroup ' + printObject(e), 4);
            }
        });
    }

    /**
     * removes the clients from the given servergroups
     * @param {Client} client the client to remove servergroups from
     * @param {ServerGroup[] | Integer[]} groups the servergroups or groupIDs that should be removed from the client
     */
    function clientServerGroupRemoveFromGroups(client, groups) {
        groups = arrayCreateArray(groups);
        if (groups.length === 0) {
            log('clientServerGroupAddToGroups: Provided no group to remove', 3);
            return;
        }
        groups.forEach(e => {
            if (clientServerGroupsIsMemberOf(client, e)) {
                client.removeFromServerGroup(e);
                log('clientServerGroupRemoveFromGroups: Client ' + printObject(client) + ' was removed from the servergroup ' + printObject(e), 5);
            } else {
                log('clientServerGroupRemoveFromGroups: Client ' + printObject(client) + ' did not had the group ' + printObject(e), 4);
            }
        });
    }

    /*
        Strings
    */

    /**
     * checks if a string is a valid UID
     * @param {String} string string to check for UID
     * @return {Boolean} returns true or false depending on if the string matches a UID or not
     */
    function stringMatchUID(string) {
        if (backendEngine === 'ts3') {
            return string.match(/(^[\w\d/+]{27}=$)/g) != null;
        }
        return false;
    }

    /*
        Group
    */

    /**
     * returns a string representation of a group
     * @param {Group} group
     * @return {String} a string representation of the given group
     */
    function groupToString(group) {
        return ('[' + group.id() + ': ' + group.name() + ']');
    }

    /**
     * parses the groupIDs from a given array of servergroups
     * @param {ServerGroup[]} serverGroups
     * @return {Integer[]} returns an array containing the parsed groupIDs
     */
    function serverGroupParseIDs(serverGroups) {
        serverGroups = arrayCreateArray(serverGroups);
        let result = [];
        serverGroups.forEach(e => {
            if (isNumber(serverGroups[0])) {
                result.push(e);
            } else {
                result.push(e.id());
                log('serverGroupParseIDs: Resolved the servergroup ' + printObject(e) + ' to the ID ' + e.id(), 5);
            }
        });
        return result;
    }

    /**
     * parses the servergroups from a given array of groupIDs
     * @param {Integer[]} groupIDs
     * @return {ServerGroup[]} returns an array containing the parsed servergroups
     */
    function serverGroupParseGroups(groupIDs) {
        groupIDs = arrayCreateArray(groupIDs);
        let result = [];
        groupIDs.forEach(e => {
            if (!isNumber(e)) {
                result.push(e);
            } else {
                let group = backend.getServerGroupByID(e);
                if (group) {
                    result.push(group);
                    log('serverGroupParseGroups: Resolved the ID ' + e + ' to the servergroup ' + printObject(group), 5);
                } else {
                    log('serverGroupParseGroups: A servergroup with the ID ' + e + ' was not found on the server', 2);
                }
            }
        });
        return result;
    }

    /*
        User
    */

    /**
     * returns a string representation of a user
     * @param {User} user
     * @return {String} a string representation of the given user
     */
    function userToString(user) {
        return ('[' + user.id() + ': ' + user.name() + ']');
    }

    /**
     * checks if the Sinusbot user has the required Sinusbot privileges
     * @param {User} user a Sinusbot user
     * @param {Integer} privileges the numerical value of the required privileges
     * @return {Boolean} returns true if the Sinusbot user has the required privileges
     */
    function userHasPrivileges(user, privileges) {
        let userPriv = user.privileges();
        if ((userPriv & privileges) === privileges) return true;
        return false;
    }

    /**
     * retrieves the clients Sinusbot privileges
     * @param {Client} client a teamspeak client
     * @return {Integer} returns the privileges as a numerical value
     */
    function userGetClientPrivileges(client) {
        let users = engine.getUsers();
        let privileges = 0;
        users.forEach(e => {
            if (userIsClientUser(client, e)) privileges = privileges | e.privileges();
        });
        return privileges;
    }

    /**
     * checks if the client has the required Sinusbot privileges
     * @param {Client} client a teamspeak client
     * @param {Integer} privileges the numerical value of the required privileges
     * @return {Boolean} returns true if the client has the required privileges
     */
    function userClientHasPrivileges(client, privileges) {
        let clientPrivileges = userGetClientPrivileges(client);
        return ((clientPrivileges & privileges) === privileges);
    }

    /**
     * checks if the client has access to the given Sinusbot user
     * @param {Client} client A Teamspeak Client
     * @param {User} user a Sinusbot user
     * @return {Boolean} returns true if the user either has a matching UID or the client is member of the required servergroup
     */
    function userIsClientUser(client, user) {
        if (user.tsUid() === client.uid()) {
            log('userIsClientUser: ' + printObject(client) + '-' + printObject(user) + ': UID Match', 5);
            return true;
        }
        if (clientServerGroupsIsMemberOf(client, user.tsGroupId())) {
            log('userIsClientUser: ' + printObject(client) + '-' + printObject(user) + ': ServerGroup Match', 5);
            return true;
        } else {
            return false;
        }
    }

    /*
        Track
    */

    /**
     * returns a string representation of a track
     * @param {Track} track
     * @return {String} a string representation of the given track
     */
    function trackToString(track) {
        return ('[' + track.artist() + ': ' + track.title() + ']');
    }

    /*
        Playlist
    */

    /**
     * returns a string representation of a playlist
     * @param {Playlist} playlist
     * @return {String} a string representation of the given playlist
     */
    function playlistToString(playlist) {
        return ('[' + playlist.id() + ': ' + playlist.name() + ']');
    }

    /*
        Helper
    */

    /**
     * checks if an object is null or undefined
     * @param {Object} element
     * @return {Boolean} returns true if the object is null or undefined
     */
    function empty(element) {
        if (!element || typeof element === 'undefined') return true;
        return false;
    }

    /**
     * returns a string representation of an object
     * @param {Object} object
     * @return {String} a string representation of the given object
     */
    function printObject(object) {
        try {
            object.nick();
            return clientToString(object);
        } catch (err) {
            try {
                object.icon();
                return groupToString(object);
            } catch (err) {
                try {
                    object.codec();
                    return channelToString(object);
                } catch (err) {
                    try {
                        object.isAdmin();
                        return userToString(object);
                    } catch (err) {
                        try {
                            object.artist();
                            return trackToString(object);
                        } catch (err) {
                            try {
                                object.getTracks();
                                return playlistToString(object);
                            } catch (err) {
                                if (Array.isArray(object)) {
                                    return arrayToString(object);
                                } else {
                                    return '' + object;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * returns a string representation of an array
     * @param {Object[]} array
     * @return {String} a string representation of the given array
     */
    function arrayToString(array) {
        let result = '[';
        array.forEach(e => {
            result += printObject(e) + ',';
        });
        return result.slice(0, -1) + ']';
    }

    /**
     * checks if an array contains all elements of another given array
     * @param {Object[]} array
     * @param {Object[]} elements the elements to search for in the array
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Boolean} returns true if all elements are contained in the given array
     */
    function arrayContainsAll(array, elements, compare) {
        if (arrayMissingElements(array, elements, compare).length > 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * concatenates two arrays
     * @param {Object[]} array
     * @param {Object[]} elements
     * @return {Object[]} returns a new array containing all elements of the two given arrays
     */
    function arrayCombineArrays(array, elements) {
        array = arrayCreateArray(array);
        elements = arrayCreateArray(elements);
        let result = [];
        for (let e of array) {
            result.push(e);
        }
        for (let e of elements) {
            result.push(e);
        }
        log('arrayCombineArrays: Found ' + result.length + ' Objects', 4);
        return result;
    }

    /**
     * checks if an array contains the given element
     * @param {Object[]} array
     * @param {Object} element
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Boolean} returns true if the element is contained in the array
     */
    function arrayContainsElement(array, element, compare) {
        if (!compare) compare = equal;
        for (let e of array) {
            if (compare(e, element)) return true;
        }
        return false;
    }

    /**
     * checks if an array contains at least one element of another given array
     * @param {Object[]} array
     * @param {Object[]} elements the elements to search for in the array
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Boolean} returns true if at least one element is contained in the given array
     */
    function arrayContainsOne(array, elements, compare) {
        for (let e of elements) {
            if (arrayContainsElement(array, e, compare)) return true;
        }
        return false;
    }

    /**
     * creates an array containing the given element or returns immediately if an array is given
     * @param {Object[] | Object} element
     * @return {Object[]} an array containing the given elements
     */
    function arrayCreateArray(element) {
        if (!Array.isArray(element)) {
            let array = [];
            if (element) array.push(element);
            return array;
        } else {
            return element;
        }
    }

    /**
     * creates a set of the given array, removing any duplicates
     * @param {Object[]} array
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Object[]} the set representation of the given array
     */
    function arrayCreateSet(array, compare) {
        let result = [];
        if (!Array.isArray(array)) {
            result.push(array);
            return result;
        } else {
            for (let e of array) {
                if (!arrayContainsElement(result, e, compare)) result.push(e);
            }
            return result;
        }
    }

    /**
     * returns the elements that differ are contained in only one of the given arrays
     * @param {Object[]} array
     * @param {Object[]} elements
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Object[]} an array that contains the elements that were only present in one of the arrays
     */
    function arrayDifference(array, elements, compare) {
        let result = [];
        for (let e of elements) {
            if (!arrayContainsElement(array, e, compare)) result.push(e);
        }
        for (let e of array) {
            if (!arrayContainsElement(elements, e, compare)) result.push(e);
        }
        return result;
    }

    /**
     * gets the index of an object in an array or -1 if it is not contained
     * @param {Object[]} array
     * @param {Object} element
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Integer} [description]
     */
    function arrayGetIndex(array, element, compare) {
        if (!compare) compare = equal;
        for (let i = 0; i <= array.length; i++) {
            if (compare(array[i], element)) return i;
        }
        return -1;
    }

    /**
     * removes undefined and null entries from an array
     * @param {Object[]} array
     * @return {Object[]} a copy of the array with any undefined or null entries removed
     */
    function arrayRemoveUndefined(array) {
        array = arrayCreateArray(array);
        let result = [];
        for (let i of array) {
            if (!empty(array[i])) result.push(array[i]);
        }
        log('arrayRemoveUndefined: Removed ' + (array.length - result.length) + ' undefined or null entries from the array', 4);
        return result;
    }

    /**
     * returns the missing elements in the array
     * @param {Object[]} array
     * @param {Object[]} elements the array that contains the elements to search for
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Object[]} an array containing the missing elements
     */
    function arrayMissingElements(array, elements, compare) {
        elements = arrayCreateArray(elements);
        let result = [];
        elements.forEach(e => {
            if (!arrayContainsElement(array, e, compare)) result.push(e);
        });
        log('arrayMissingElements: Found ' + result.length + ' missing entries in the arrays', 4);
        return result;
    }

    /**
     * removes the elements of one array of another array
     * @param {Object[]} array
     * @param {Object[]} elements the array that contains the elements to remove
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Array} a copy of the array that does not contain the removed elements
     */
    function arrayRemoveElements(array, elements, compare) {
        if (!compare) compare = equal;
        array = arrayCreateArray(array);
        elements = arrayCreateArray(elements);
        let result = [];
        array.forEach(e => {
            if (!arrayContainsElement(elements, e, compare)) result.push(e);
        });
        log('arrayRemoveElements: Removed ' + (array.length - result.length) + ' elements from the array', 4);
        return result;
    }

    /**
     * checks if a is equal b
     * @param {Object} a
     * @param {Object} b
     * @return {Boolean} returns true when a is equal b
     */
    function equal(a, b) {
        return (a == b);
    }

    /**
     * checks if a is not equal b
     * @param {Object} a
     * @param {Object} b
     * @return {Boolean} returns true when a is not equal b
     */
    function unequal(a, b) {
        return (a != b);
    }

    /**
     * checks if a is greater b
     * @param {Object} a
     * @param {Object} b
     * @return {Boolean} returns true when a is greater b
     */
    function greater(a, b) {
        return (a > b);
    }

    /**
     * checks if a is less b
     * @param {Object} a
     * @param {Object} b
     * @return {Boolean} returns true when a is less b
     */
    function less(a, b) {
        return (a < b);
    }

    /**
     * checks if a is greater or equal b
     * @param {Object} a
     * @param {Object} b
     * @return {Boolean} returns true when a is greater or equal b
     */
    function greaterOrEqual(a, b) {
        return (a >= b);
    }

    /**
     * checks if a is less or equal b
     * @param {Object} a
     * @param {Object} b
     * @return {Boolean} returns true when a is less or equal b
     */
    function lessOrEqual(a, b) {
        return (a <= b);
    }

    /**
     * checks if one string is contained in another
     * @param {String} a
     * @param {String} b
     * @return {Boolean} returns true when string b is contained in string a
     */
    function contains(a, b) {
        if (a.includes(b)) return true;
        return false;
    }

    /**
     * checks if one string is contained in another, ignoring the case
     * @param {String} a
     * @param {String} b
     * @return {Boolean} returns true when string b is contained in string a
     */
    function containsIgnoreCase(a, b) {
        if (a.toLowerCase().includes(b.toLowerCase())) return true;
        return false;
    }

    /**
     * checks if the value is a number
     * @param {Object} number object that should be checked
     * @return {Boolean} returns true if the object is a number
     */
    function isNumber(number) {
        return !isNaN(number);
    }

    /**
     * simple password generator
     * @param {number} length password Length
     * @param {String} charset charset to use for the password generation
     * @return {String} returns a password with the specified length
     */
    function generatePassword(length, charset) {
        let result = '';
        if (charset === undefined)
            charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++)
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        return result;
    }

    /**
     * checks if the input is a valid integer number
     * @param {Number} value number to check for integer
     * @return {Boolean} returns true of false
     */
    function isInt(value) {
        return !isNaN(value) && Number.isInteger(value);
    }

    /**
     * parse an array of objects to an array of a single chosen properties
     * @param {Object[]} array array to parse
     * @param {String} attribute name of the property that should be parsed
     * @param {Boolean} isFunction check when the property is a function
     * @return {Object[]} parsed array
     */
    function arrayObjectParseAttribute(array, attribute, isFunction) {
        array = arrayCreateArray(array);
        let result = [];
        array.forEach(e => {
            if (isFunction) {
                result.push(e[attribute]());
            } else {
                result.push(e[attribute]);
            }
        });
        log('arrayObjectParseAttribute: Parsed ' + result.length + ' Objects', 4);
        return result;
    }

    /**
     * set the attributes of a object to a new value
     * @param {Object[]} array object to apply attribute changes to
     * @param {String} attribute the attribute which should get applied
     * @param {Object[] | Object} value array or single object that should be applied | arrays will get applied in array element order
     */
    function arrayObjectSetAttribute(array, attribute, value) {
        array = arrayCreateArray(array);
        value = arrayCreateArray(array);
        array.forEach(e => {
            e[attribute].apply(null, value);
        });
    }

    /**
     * filters an array for a specifc attribute value
     * @param {Object[]} array the array to filter
     * @param {String} attribute the attribute to filter for
     * @param {Object} value value to check for
     * @param {Boolean} isFunction flag for comparing function or attributes of objects
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Object[]} found object that matched the value
     */
    function arrayFilterByAttribute(array, attribute, value, isFunction, compare) {
        if (!compare) compare = equal;
        let result = [];
        array.forEach(e => {
            if (isFunction) {
                if (compare(e[attribute](), value)) result.push(e);
            } else {
                if (compare(e[attribute], value)) result.push(e);
            }
        });
        return result;
    }

    /**
     * compares an objects property with a specific value
     * @param {Object} object object to check
     * @param {String} property name of the property that should be checked
     * @param {Object} element value that should be compared to the property
     * @param {Function} compare a compare function that should be used for the comparison | if not set, 'equal' is used
     * @return {Boolean} returns the value of the comparison
     */
    function objectFunctionEqualsElement(object, property, element, compare) {
        if (!compare) compare = equal;
        return compare(object[property](), element);
    }

    /*
        Lib Definition
    */

    const libModule = {
        log: log,

        general: {
            checkVersion: checkVersion,
            log: log,
            getBots: getActiveBotInstances
        },

        channel: {
            equal: equalChannelObjects,
            toString: channelToString,
            getDefault: channelGetDefault,
            getChannels: channelGetChannels,
            getSubchannels: channelGetSubChannels, //legacy
            getSubChannels: channelGetSubChannels,
            getAllSubChannels: channelGetAllSubChannels,
            isSubChannelOf: channelIsSubChannelOf,
            getRelativeDepth: channelGetRelativeDepth,
            getAbsoluteDepth: channelGetAbsoluteDepth
        },

        client: {
            toString: clientToString,
            toURLString: clientToURLString,
            urlToClient: clientUrlToClient,
            equal: equalClientObjects,
            filterByClients: clientFilterByClients,
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
            getPrivileges: userGetClientPrivileges
        },

        channelGroup: {
            toString: groupToString
        },

        serverGroup: {
            toString: groupToString,
            toIDs: serverGroupParseIDs,
            toGroups: serverGroupParseGroups
        },

        string: {
            matchUID: stringMatchUID
        },

        user: {
            toString: userToString,
            hasPrivileges: userHasPrivileges,
            hasClientPrivileges: userClientHasPrivileges,
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
                PRIV_EDITINSTANCE: 131072
            }
        },

        track: {
            toString: trackToString
        },

        playlist: {
            toString: playlistToString
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
            setAttribute: arrayObjectSetAttribute,
            filterByAttribute: arrayFilterByAttribute
        },

        helper: {
            generatePassword: generatePassword,
            printObject: printObject,
            isNumber: isNumber,
            isInt: isInt,
            objectFunctionEqualsElement: objectFunctionEqualsElement
        },

        comparator: {
            equal: equal,
            unequal: unequal,
            greater: greater,
            less: less,
            greaterEqual: greaterOrEqual,
            lessEqual: lessOrEqual,
            contains: contains,
            containsIgnoreCase: containsIgnoreCase
        },
    };

    engine.export(libModule);
});
