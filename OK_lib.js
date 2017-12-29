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

    //on.save == .notify("HURRAY") about logging oderso

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

    var libModul = {
      ts: {
        groups: {
          add: group_add,
          remove: function(aa, bb) {
            return aa+bb;
          }
        },
        chat: {
          poke: function(bla){

          },
          chat: function(bla){

          }
        }
      },
      discord:{
        
      }
    };


    engine.export(libModule);
});
