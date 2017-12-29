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

    engine.notify('OK_lib successfully loaded.');

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
            if (!clientIsMemberOf(client, checkGroup)){
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
        group: {
        }
    };


    engine.export(libModule);
});
