registerPlugin({
    name: 'eZlib',
    engine: '>= 0.11',
    version: '0.1',
    description: 'A lib for other scripts to use',
    author: 'Diesmon <dontmindme12@web.de>, Tuetchen <',
},

function(sinusbot, config) {
    var engine = require('engine');

    var libModul = {
        groups: {
          add: function(client, group) {
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
          },
          remove: function(aa, bb) {
            return aa+bb;
          }
        }
    };

    var lib2Modul = {
      addSingle: function(a, b) {
        return a+b;
      },
      addArray: function(aa, bb) {
        return aa+bb;
      }
    };

    engine.export(libModule);
});
