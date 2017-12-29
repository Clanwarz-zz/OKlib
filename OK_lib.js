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
        if (logLevel >= config.logLevel){
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
        for (var checkGroup in checkGroups){
            if (!clientServerGroupsIsMemberOf(client, checkGroup)){
                return false;
            }
        }
        return true;
    }

    /**
    * Checks if a Client is the Member of a Server Group.
    *
    * @param {Client} client The tested Client as a Client Object.
    * @param {number} checkGroups The GroupID of the Group that should be checked.
    * @returns {boolean} True if the Client is Member of the Server Group, else False.
    **/
    function clientServerGroupsIsMemberOf(client, checkGroup){
        var serverGroups = client.getServerGroups();
        for (var serverGroup in serverGroups){
            if (serverGroups[serverGroup].id() == checkGroup){
                return true;
            }
        }
        return false;
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

    function group_add(client, group){
        if(group.isArray){
            clientGroups = client.getServerGroups();
            if(group.length > 0){
                for(var curGroup in group){
                    if(clientGroups.map(function(gr){return gr.id();}).indexOf(group[curGroup]) === -1){
                        groupChecker = null;
                        groupChecker = backend.getServerGroupByID(group[curGroup]);
                        if(groupChecker){
                            client.addToServerGroup(groupChecker);
                        }
                        else{
                            engine.log("Group wasn't added. Reason: Group ID " + group[curGroup] + " was not found on the server");
                        }
                    }
                    else{
                        engine.log("Group wasn't added. Reason: The client already got the Group ID " + group[curGroup]);
                    }
                }
            }
        }
        else {

        }
    }

    /*
        Group
    */


    /*
        Lib Definition
    */

    function removeGroups(client){
        var clientGroups = client.getServerGroups();
        if(afkGroups.length > 0){
            for(var group in afkGroups){
                for(var clientGroup in clientGroups){
                    if(afkGroups[group] == clientGroups[clientGroup].id()){
                        client.removeFromServerGroup(clientGroups[clientGroup]);
                    }
                }
            }
        }
    }

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

    var libModul = {
        groups: {
            add: group_add,
            remove: function(aa, bb) {
                return aa+bb;
            }
        },
        chat: {
            poke: function(bla){

            },
        }
    };


    engine.export(libModule);
});
