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

    event.on('chat', function(ev) {
        if (ev.text == "!info"){
            ev.client.chat("This bot uses the OK_lib, which is a libary for easier script functions.");
        }
    });

    function log(message, logLevel){
        if (logLevel >= config.logLevel){
            engine.log(message);
        }
    }

    function groupAdd(client, group){
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
      remove: function(aa, bb) {
        return aa+bb;
      },
      chat: {
        poke: function(bla){

        },
        chat: function(bla){

        }
      }
    };


    engine.export(libModule);
});
