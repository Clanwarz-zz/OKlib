registerPlugin({
    name: 'OK_lib',
    engine: '>= 0.11',
    version: '0.1',
    description: 'A lib that is OK. For other scripts to use.',
    author: 'Diesmon <dontmindme12@web.de> & Tuetchen || Smorrebrod || Cedrik <cedrik.paetz@gmail.com>',
},
{
    name: 'logLevel',
    title: 'Sets a global debug log level for all scripts that use this lib. The logs will be displayed in the instance logs.',
    type: 'number'
},

function(sinusbot, config) {
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
    
    engine.notify('OK_lib loaded.');

    /*
        General
    */

    event.on('chat', function(ev) {
        if (ev.text == "!info"){
            ev.client.chat("This bot uses the OK_lib, which is a libary for easier script functions.");
        }
    });

    /**
    * Logs a message to the Instance Log.
    *
    * @param {string} message The Log Message.
    * @param {number} logLevel The Log Level of this Log Message.
    **/
    function log(message, logLevel){
        if (logLevel <= config.logLevel){
            engine.log(message);
        }
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
    * Checks if a Client is the Member of a Server Group.
    *
    * @param {Client} client The tested Client as a Client Object.
    * @param {number[]} checkGroups The Groups that should be checked as an Array of GroupIDs.
    * @returns {object} Contains two arrays with GroupID's, the first with GroupID's in which the client is and the second in which the client is not.
    **/
    function clientServerGroupsIsMemberaAndIsNotMember(client, checkGroup){
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
                        log("Group wasn't added. Reason: Group ID " + groups[curGroup] + " was not found on the server", 5);
                    }
                }
                else {
                    log("Group wasn't added. Reason: The client already got the Group ID " + groups[curGroup], 10);
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
                    log("Group wasn't removed. Reason: The client does not have the Group ID " + groups[curGroup], 10);
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

    function arrayContainsElement(array, element){
        for (var arrayElement in array){
            if (array[arrayElement] == element){
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

	function arrayCreateArray(element){
      	if (!element.isArray()){
          	var array = [];
        	array.push(element);
          	return array;
      	}
      	else{
          	return element;
        }
    }

    /*
        Lib Definition
    */

    function messageUser(client, i){
        setTimeout(function(){
            client.chat(ruleArray[i].rule);
            i++;
            if(i < ruleArray.length){
                messageUser(client, i);
            }
            else{
                if(config.confirmRules == 1){
                    store.set(client.uid(), 0);
                    client.chat(confirmString);
                    if(config.kickDecision == true){
                        setTimeout(function(){
                            if(store.get(client.uid()) == 0){
                                var clientCheck = backend.getClientByUID(client.uid());
                                if(clientCheck){
                                    store.unset(client.uid());
                                    client.kickFromServer(kickReasonTime);
                                }
                            }
                        }, config.kickDelay * 1000);
                    }
                }
                else if(config.confirmRules == 0){
                    store.set(client.uid(), 2);
                }
            }
        }, messageDelay);
    }

    function checkIfIgnore(channel){
        if(channelIgnore.length > 0){
            for(var i = 0; i < channelIgnore.length; i++){
                if(channelIgnore[i].channel == channel.id()){
                    return true;
                }
            }
        }
        return false;
    }

    var libModule = {
        general: {
            log: log
        },
      	client: {
          	serverGroups: {
              	isMemberOf: clientServerGroupsIsMemberOf,
              	isMemberOfAll: clientServerGroupsIsMemberOfAll
            }
        },
        serverGroups: {

        },
        chat: {
            poke: function(bla){

            },
        },
        helper: {
            isNumber: isNumber,
            createArray: createArray
        }
    };


    engine.export(libModule);
});
