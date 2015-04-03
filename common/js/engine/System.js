define(function(require) {
    return Class.extend({
        init: function(type)
        {
            if (typeof(type) === 'undefined')
            {
                throw "No type on system, error.";
            }

            this.type = type;
            this.engine = null;
            this.entities = [];
            this.enabled = true;
        },

        addedToEngine: function()
        {
            // Override me!
        },

        acceptsEntity: function(entity)
        {
            return false;
        },

        addEntity: function(entity)
        {
            //console.log(this.type + " adding entity of type: " + entity.type);

            this.entities.push(entity);
            entity.addSystem(this);
            this.entityAdded(entity);
        },

        removeEntity: function(entity)
        {
            //console.log(this.type + " removing entity of type: " + entity.type);

            for (var i = 0; i < this.entities.length; i++)
            {
                if (entity === this.entities[i])
                {
                    this.entities.splice(i, 1);

                    // Don't remove the system from the entity... it messes up the loop in GameEngine
                    /*for (var j = 0; j < entity.systems.length; j++)
                    {
                        if (entity.systems[j].type === this.type)
                        {
                            entity.systems.splice(j, 1);
                        }
                    }*/

                    break;
                }
            }

            this.entityRemoved(entity);
        },

        entityAdded: function(entity)
        {
            // Override me!
        },

        entityRemoved: function(entity)
        {
            // Override me!
        },

        preUpdate: function(timeDx)
        {

        },

        update: function(timeDx)
        {

        },

        updateEntity: function(timeDx, entity)
        {

        },

        postUpdate: function(timeDx)
        {

        }
    });
});