
define(function(require) {

    var System = require("engine/System");
    var Entity = require("engine/Entity");

    return Class.extend({
        init: function(options)
        {
            this.systems = [];

            this.isServer = options.isServer || false;

            this.lastEntityId = 0;
            this.levelEntities = [];
            this.entities = [];
            this.entitiesAdded = [];
            this.entitiesRemoved = [];

            this.setEntityBuilder(options.entityBuilder || null);
            this.setResourceManager(options.resourceManager || null);

            this.players = [];
            this.playersAdded = [];
            this.playersRemoved = [];

            this.eventHandlers = {};

            this.tickTime = 0;
            this.lastTickTime = new Date().getTime();
            this.timeDx = this.tickTime - this.lastTickTime;
        },

        start: function()
        {
            console.log("GameEngine: starting");

            var that = this;

            if (!this.isServer)
            {
                (function animloop(){
                    requestAnimFrame(animloop);
                    that.loop();
                })();
            }
            else
            {

                requestAnimFrame(function() { that.loop() });
            }

        },

        loop: function()
        {
            var currentTime = new Date().getTime();
            this.timeDx = currentTime - this.lastTickTime;
            this.tickTime += this.timeDx;

            this.entitiesAdded = [];
            this.entitiesRemoved = [];
            this.playersAdded = [];
            this.playersRemoved = [];

            var i, j, s, e;

            // PRE-UPDATE
            for (i = 0; i < this.systems.length; i++)
            {
                s = this.systems[i];
                if (s.enabled)
                {
                    s.preUpdate(this.timeDx);
                }
            }

            // UPDATE
            for (i = 0; i < this.systems.length; i++)
            {
                s = this.systems[i];
                if (s.enabled)
                {
                    s.update(this.timeDx);
                }
            }

            // LEVEL ENTITIES
            for (i = this.levelEntities.length-1; i >= 0; i--)
            {
                e = this.levelEntities[i];

                if (!e.toRemove)
                {
                    for (j = 0; j < e.systems.length; j++)
                    {
                        s = e.systems[j];
                        s.updateEntity(this.timeDx, e);
                    }
                }
            }

            // ENTITIES
            for (i = this.entities.length-1; i >= 0; i--)
            {
                e = this.entities[i];

                for (j = 0; j < e.systems.length; j++)
                {
                    s = e.systems[j];
                    if (!e.toRemove)
                    {
                        s.updateEntity(this.timeDx, e);
                    }
                    else
                    {
                        s.removeEntity(e);
                    }
                }

                if (e.toRemove)
                {
                    this.entities.splice(i, 1);
                    e.systems = [];
                    this.entitiesRemoved.push(e);
                }
            }

            // POST UPDATE
            for (i = 0; i < this.systems.length; i++)
            {
                s = this.systems[i];
                if (s.enabled)
                {
                    s.postUpdate(this.timeDx);
                }
            }

            var timeSpent = new Date().getTime() - currentTime;

            this.lastTickTime = currentTime;
        },

        addSystem: function(system)
        {
            if (!(system instanceof System))
            {
                throw "GameEngine: Attempting to add a non System in addSystem";
            }

            //console.log("GameEngine: adding system: " + system.type);
            system.engine = this;
            this.systems.push(system);
            system.addedToEngine();
        },

        getSystem: function(type)
        {
            for (var i = 0; i < this.systems.length; i++)
            {
                var s = this.systems[i];
                if (s.type === type)
                {
                    return s;
                }
            }
        },

        enableAllSystems: function()
        {
            for (var i = 0; i < this.systems.length; i++)
            {
                this.systems[i].enabled = true;
            }
        },

        disableAllSystems: function()
        {
            for (var i = 0; i < this.systems.length; i++)
            {
                this.systems[i].enabled = false;
            }
        },

        addLevelEntity: function(entity)
        {
            if (!(entity instanceof Entity))
            {
                throw "GameEngine: Attempting to add a non Entity in addEntity";
            }

            console.log("GameEngine: adding level entity of type: " + entity.type);

            if (entity.id === 0)
            {
                entity.id = this.lastEntityId++;
            }

            this.levelEntities.push(entity);
            entity.engine = this;

            for (var i = 0; i < this.systems.length; i++)
            {
                var sys = this.systems[i];
                if (sys.acceptsEntity(entity))
                {
                    sys.addEntity(entity);
                }
            }
        },

        addEntity: function(entity)
        {
            if (!(entity instanceof Entity))
            {
                throw "GameEngine: Attempting to add a non Entity in addEntity";
            }

            if (entity.logEntity)
            {
                console.log("GameEngine: adding actor entity of type: " + entity.type);
            }


            if (entity.id === 0)
            {
                entity.id = this.lastEntityId++;
            }

            //console.log("GameEngine: adding entity of type: " + entity.type);

            this.entities.push(entity);
            this.entitiesAdded.push(entity);
            entity.engine = this;

            for (var i = 0; i < this.systems.length; i++)
            {
                var sys = this.systems[i];
                if (sys.acceptsEntity(entity))
                {
                    sys.addEntity(entity);
                }
            }
        },

        getEntityById: function(id)
        {
            for (var i = 0; i < this.entities.length; i++)
            {
                if (this.entities[i].id === id)
                {
                    return this.entities[i];
                }
            }

            return null;
        },

        addPlayer: function(player)
        {
            console.log("GameEngine adding player: " + player.name);

            this.players.push(player);
            this.playersAdded.push(player);
        },

        removePlayer: function(playerId)
        {
            console.log("GameEngine removing player: " + playerId);
           for (var i = 0; i < this.players.length; i++)
           {
               var p = this.players[i];
               if (p.id === playerId)
               {
                   this.players.splice(i, 1);
                   this.playersRemoved.push(p);
               }
           }
        },

        getPlayerById: function(id)
        {
            for (var i = 0; i < this.players.length; i++)
            {
                if (this.players[i].id === id)
                {
                    return this.players[i];
                }
            }

            return null;
        },

        addEventHandler: function(eventType, context, callback)
        {
            if (!this.eventHandlers[eventType])
            {
                this.eventHandlers[eventType] = [];
            }

            this.eventHandlers[eventType].push({
                context: context,
                callback: callback
            });
        },

        raiseEvent: function(eventType, data)
        {
            var handlers = this.eventHandlers[eventType];

            if (handlers !== null)
            {
                for (var i = 0; i < handlers.length; i++)
                {
                    handlers[i].callback.call(handlers[i].context, data);
                }
            }
        },

        setEntityBuilder: function(entityBuilder)
        {
            this.entityBuilder = entityBuilder;
            this.entityBuilder.engine = this;
        },

        setResourceManager: function(resourceManager)
        {
            this.resourceManager = resourceManager;
            this.resourceManager.engine = this;
        }

    });
});